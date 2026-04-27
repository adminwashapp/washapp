import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../store';
import { LangProvider } from '../contexts/lang';
import { addNotificationListener, registerForPushNotifications } from '../services/notifications';
import { authApi } from '../services/api';

export default function RootLayout() {
  const { isAuthenticated, loadFromStorage } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setReady(true), 2000);
    loadFromStorage()
      .catch(() => {})
      .finally(() => { clearTimeout(timeout); setReady(true); });
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const inAuth = segments[0] === '(auth)';
    if (!isAuthenticated && !inAuth) {
      router.replace('/welcome');
    } else if (isAuthenticated && inAuth) {
      router.replace('/map');
    }
  }, [isAuthenticated, ready, segments]);

  useEffect(() => {
    if (isAuthenticated) {
      registerForPushNotifications(authApi.savePushToken).catch(() => {});
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const unsub = addNotificationListener(
      () => {},
      (response: any) => {
        const missionId = response?.notification?.request?.content?.data?.missionId;
        if (missionId) {
          router.push({ pathname: '/tracking/[id]', params: { id: String(missionId) } } as any);
        }
      },
    );
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [router]);

  if (!ready) {
    return (
      <SafeAreaProvider>
        <LangProvider>
          <View style={{ flex: 1, backgroundColor: '#040c24', alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color="#1558f5" />
            <StatusBar style="light" />
          </View>
        </LangProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <LangProvider>
        <StatusBar style="auto" />
        <Slot />
      </LangProvider>
    </SafeAreaProvider>
  );
}