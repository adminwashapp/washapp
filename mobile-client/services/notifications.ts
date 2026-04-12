import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { authApi } from './api';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  // Check/request permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('[Notifications] Permission refusée');
    return null;
  }

  // Get Expo push token
  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId: 'washapp', // Replace with your EAS project ID
  });

  const token = tokenData.data;

  // Save token to backend
  try {
    await authApi.savePushToken(token);
  } catch (e) {
    console.warn('[Notifications] Impossible de sauvegarder le token:', e);
  }

  return token;
}

// Listen for incoming notifications while app is open
export function addNotificationListener(
  onReceived: (notification: Notifications.Notification) => void,
  onResponse: (response: Notifications.NotificationResponse) => void,
) {
  const sub1 = Notifications.addNotificationReceivedListener(onReceived);
  const sub2 = Notifications.addNotificationResponseReceivedListener(onResponse);
  return () => { sub1.remove(); sub2.remove(); };
}

// Schedule a local notification (for testing)
export async function scheduleLocalNotification(title: string, body: string, delaySeconds = 1) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: 'default' },
    trigger: { seconds: delaySeconds } as any,
  });
}