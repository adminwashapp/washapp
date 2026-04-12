import { useEffect } from 'react';
import { LangProvider } from '../contexts/lang';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { useAuthStore } from '../store';
import { washerSocket } from '../services/socket';
import { registerForPushNotifications } from '../services/notifications';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isAuthenticated, isLoading, loadFromStorage } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    loadFromStorage();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    SplashScreen.hideAsync();

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/welcome');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)/map');
      washerSocket.connect();
    }
  }, [isAuthenticated, isLoading, segments]);

  // Register push notifications when washer is logged in
  useEffect(() => {
    if (isAuthenticated) {
      registerForPushNotifications().catch(() => {});
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const notifSub = Notifications.addNotificationResponseReceivedListener((response) => {
      const missionId = response.notification.request.content.data?.missionId;
      if (missionId) {
        router.push(`/mission/${missionId}`);
      }
    });
    return () => {
      notifSub.remove();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <LangProvider><Slot /></LangProvider>
    </GestureHandlerRootView>
  );
}