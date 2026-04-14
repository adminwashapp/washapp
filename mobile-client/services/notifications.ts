import { Platform } from 'react-native';
import Constants from 'expo-constants';

const isExpoGo = Constants.appOwnership === 'expo';

export async function registerForPushNotifications(
  saveToken: (token: string) => Promise<any>,
): Promise<string | null> {
  if (Platform.OS === 'web' || isExpoGo) return null;
  try {
    const Notifications = await import('expo-notifications');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== 'granted') {
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
  onReceived: (n: any) => void,
  onResponse: (r: any) => void,
) {
  if (isExpoGo) return () => {};
  let s1: any, s2: any;
  import('expo-notifications').then(N => {
    s1 = N.addNotificationReceivedListener(onReceived);
    s2 = N.addNotificationResponseReceivedListener(onResponse);
  });
  return () => { s1?.remove(); s2?.remove(); };
}