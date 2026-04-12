import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../store';
import { LangProvider } from '../contexts/lang';
import { registerForPushNotifications } from '../services/notifications';

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
      router.replace('/(auth)/welcome');
    } else if (isAuthenticated && inAuth) {
      router.replace('/(tabs)/map');
    }
  }, [isAuthenticated, ready, segments]);

  // Register push notifications when user is logged in
  useEffect(() => {
    if (isAuthenticated) {
      registerForPushNotifications().catch(() => {});
    }
  }, [isAuthenticated]);

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