import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Push notifications not supported in Expo Go since SDK 53
const isExpoGo = Constants.appOwnership === 'expo';

if (!isExpoGo) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

export async function registerForPushNotifications(
  saveToken: (token: string) => Promise<any>,
): Promise<string | null> {
  if (Platform.OS === 'web' || isExpoGo) return null;

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') return null;

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    });

    const token = tokenData.data;
    await saveToken(token).catch(() => {});
    return token;
  } catch (e) {
    console.warn('[Notifications] Skipped:', e);
    return null;
  }
}

export function addNotificationListener(
  onReceived: (n: Notifications.Notification) => void,
  onResponse: (r: Notifications.NotificationResponse) => void,
) {
  if (isExpoGo) return () => {};
  const s1 = Notifications.addNotificationReceivedListener(onReceived);
  const s2 = Notifications.addNotificationResponseReceivedListener(onResponse);
  return () => { s1.remove(); s2.remove(); };
}