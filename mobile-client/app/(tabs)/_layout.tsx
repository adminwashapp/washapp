import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tabs.Screen name="map" />
      <Tabs.Screen name="missions" />
      <Tabs.Screen name="account" />
    </Tabs>
  );
}