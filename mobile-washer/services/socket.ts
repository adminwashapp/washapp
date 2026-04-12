import { io, Socket } from 'socket.io-client';
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WS_URL = Constants.expoConfig?.extra?.wsUrl || 'http://localhost:3001';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    priority: Notifications.AndroidNotificationPriority.MAX,
  }),
});

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

    this.socket = io(`${WS_URL}/ws`, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('WS washer connecté');
    });

    this.socket.on('mission:new', async (data: MissionData) => {
      await this.triggerMissionAlert(data);
      this.missionCallbacks.forEach((cb) => cb(data));
    });

    this.socket.on('washer:status', (data: any) => {
      this.statusCallbacks.forEach((cb) => cb(data));
    });

    this.socket.on('disconnect', () => {
      console.log('WS washer déconnecté');
    });
  }

  private async triggerMissionAlert(data: MissionData) {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

      const serviceLabels = { EXTERIOR: 'Extérieur', INTERIOR: 'Intérieur', FULL: 'Complet' };

      await Notifications.scheduleNotificationAsync({
        content: {
          title: data.type === 'INSTANT' ? '🚗 Nouvelle mission !' : '📅 Nouvelle réservation !',
          body: `${serviceLabels[data.serviceType]} — ${data.price.toLocaleString()} FCFA`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
          data: { missionId: data.missionId },
        },
        trigger: null,
      });

      const hapticInterval = setInterval(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }, 500);

      setTimeout(() => clearInterval(hapticInterval), data.timeoutSeconds * 1000);
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
