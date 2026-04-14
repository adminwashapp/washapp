import { io, Socket } from 'socket.io-client';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WS_URL = 'https://washapp-api.onrender.com';
const IS_EXPO_GO = Constants.appOwnership === 'expo';

// Lazy-load expo-notifications + expo-haptics (crash in Expo Go SDK 53)
let Notif: typeof import('expo-notifications') | null = null;
let Hapt: typeof import('expo-haptics') | null = null;

async function loadNativeModules() {
  if (IS_EXPO_GO) return;
  try {
    Notif = await import('expo-notifications');
    Hapt  = await import('expo-haptics');
    Notif.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        priority: Notif!.AndroidNotificationPriority.MAX,
      }),
    });
  } catch {}
}

// Init on first import (fire-and-forget)
loadNativeModules();

type MissionEventCallback = (data: MissionData) => void;

export interface MissionData {
  missionId: string;
  type: 'INSTANT' | 'BOOKING';
  serviceType: 'EXTERIOR' | 'INTERIOR' | 'FULL';
  price: number;
  address: string;
  lat: number;
  lng: number;
  scheduledAt?: string;
  timeoutSeconds: number;
}

class WasherSocketService {
  private socket: Socket | null = null;
  private missionCallbacks: MissionEventCallback[] = [];
  private statusCallbacks: ((data: any) => void)[] = [];
  private locationInterval: ReturnType<typeof setInterval> | null = null;

  async connect() {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) return;

    this.socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('WS washer connect\u00E9');
    });

    this.socket.on('mission:new', async (data: MissionData) => {
      await this.triggerMissionAlert(data);
      this.missionCallbacks.forEach((cb) => cb(data));
    });

    this.socket.on('washer:status', (data: any) => {
      this.statusCallbacks.forEach((cb) => cb(data));
    });

    this.socket.on('disconnect', () => {
      console.log('WS washer d\u00E9connect\u00E9');
    });
  }

  private async triggerMissionAlert(data: MissionData) {
    try {
      if (Hapt) {
        await Hapt.notificationAsync(Hapt.NotificationFeedbackType.Warning);
      }

      const serviceLabels: Record<string, string> = {
        EXTERIOR: 'Ext\u00E9rieur', INTERIOR: 'Int\u00E9rieur', FULL: 'Complet',
      };

      if (Notif) {
        await Notif.scheduleNotificationAsync({
          content: {
            title: data.type === 'INSTANT'
              ? '\uD83D\uDE97 Nouvelle mission !'
              : '\uD83D\uDCC5 Nouvelle r\u00E9servation !',
            body: `${serviceLabels[data.serviceType]} \u2014 ${data.price.toLocaleString()} FCFA`,
            sound: true,
            priority: Notif.AndroidNotificationPriority.MAX,
            data: { missionId: data.missionId },
          },
          trigger: null,
        });
      }

      if (Hapt) {
        const hapticInterval = setInterval(() => {
          Hapt!.impactAsync(Hapt!.ImpactFeedbackStyle.Heavy);
        }, 500);
        setTimeout(() => clearInterval(hapticInterval), data.timeoutSeconds * 1000);
      }
    } catch (e) {
      console.error('Erreur notification', e);
    }
  }

  goOnline(lat: number, lng: number) {
    this.socket?.emit('washer:go-online', { lat, lng });
    this.startLocationTracking();
  }

  goOffline() {
    this.socket?.emit('washer:go-offline');
    this.stopLocationTracking();
  }

  updateLocation(lat: number, lng: number) {
    this.socket?.emit('washer:update-location', { lat, lng });
  }

  acceptMission(missionId: string) {
    this.socket?.emit('mission:accept', { missionId });
  }

  declineMission(missionId: string) {
    this.socket?.emit('mission:decline', { missionId });
  }

  arrive(missionId: string) {
    this.socket?.emit('mission:arrive', { missionId });
  }

  start(missionId: string) {
    this.socket?.emit('mission:start', { missionId });
  }

  complete(missionId: string) {
    this.socket?.emit('mission:complete', { missionId });
  }

  onMission(callback: MissionEventCallback) {
    this.missionCallbacks.push(callback);
    return () => {
      this.missionCallbacks = this.missionCallbacks.filter((cb) => cb !== callback);
    };
  }

  onStatus(callback: (data: any) => void) {
    this.statusCallbacks.push(callback);
    return () => {
      this.statusCallbacks = this.statusCallbacks.filter((cb) => cb !== callback);
    };
  }

  private startLocationTracking() {
    if (this.locationInterval) return;
    this.locationInterval = setInterval(async () => {
      try {
        const Location = require('expo-location');
        const loc = await Location.getCurrentPositionAsync({});
        this.updateLocation(loc.coords.latitude, loc.coords.longitude);
      } catch {}
    }, 10000);
  }

  private stopLocationTracking() {
    if (this.locationInterval) {
      clearInterval(this.locationInterval);
      this.locationInterval = null;
    }
  }

  disconnect() {
    this.stopLocationTracking();
    this.socket?.disconnect();
    this.socket = null;
  }
}

export const washerSocket = new WasherSocketService();