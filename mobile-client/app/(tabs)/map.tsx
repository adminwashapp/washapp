import { useState, useRef, useEffect } from 'react';
import Constants from 'expo-constants';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Dimensions, Alert, StatusBar,
  TouchableWithoutFeedback, Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store';
import { useLang } from '../../contexts/lang';
import { LangToggle } from '../../components/LangToggle';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.78;
const WEB_URL = 'https://washapp.ci';

const SERVICE_OPTIONS = [
  { key: 'EXTERIOR', label: 'Exterieur', price: '1 500', desc: 'Carrosserie, vitres, jantes' },
  { key: 'INTERIOR', label: 'Interieur', price: '2 500', desc: 'Habitacle, tapis, sieges' },
  { key: 'FULL',     label: 'Complet',   price: '4 000', desc: 'Exterieur + Interieur' },
];

const MENU_ITEMS = [
  { icon: '🏠', action: 'map',      label: 'Accueil' },
  { icon: '📅', action: 'missions', label: 'Mes reservations' },
  { icon: '👤', action: 'account',  label: 'Mon compte' },
  { icon: '📋', action: 'faq',      label: 'FAQ' },
  { icon: '📄', action: 'legal',    label: 'Mentions legales' },
  { icon: '🔒', action: 'privacy',  label: 'Confidentialite' },
  { icon: '🚪', action: 'logout',   label: 'Deconnexion' },
];

// Abidjan centre par defaut
const DEFAULT_REGION = { latitude: 5.3599517, longitude: -4.0082563, latitudeDelta: 0.05, longitudeDelta: 0.05 };

export default function MapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuthStore();
  const { t } = useLang();
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState(DEFAULT_REGION);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [showServiceSheet, setShowServiceSheet] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showRecenter, setShowRecenter] = useState(false);

  const bottomSheetAnim = useRef(new Animated.Value(0)).current;
  const drawerAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const drawerOverlay = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const pos = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
        setUserLocation(pos);
        const newRegion = { ...pos, latitudeDelta: 0.04, longitudeDelta: 0.04 };
        setRegion(newRegion);
        mapRef.current?.animateToRegion(newRegion, 800);
      } catch (e) { /* location denied */ }
    })();
  }, []);

  const openDrawer = () => {
    setDrawerOpen(true);
    Animated.parallel([
      Animated.spring(drawerAnim, { toValue: 0, useNativeDriver: true, tension: 70, friction: 12 }),
      Animated.timing(drawerOverlay, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  };

  const closeDrawer = () => {
    Animated.parallel([
      Animated.timing(drawerAnim, { toValue: -DRAWER_WIDTH, duration: 220, useNativeDriver: true }),
      Animated.timing(drawerOverlay, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setDrawerOpen(false));
  };

  const handleMenuAction = (action: string) => {
    closeDrawer();
    setTimeout(() => {
      switch (action) {
        case 'map':      break;
        case 'missions': router.push('/(tabs)/missions'); break;
        case 'account':  router.push('/(tabs)/account'); break;
        case 'faq':      Linking.openURL(`${WEB_URL}/faq`); break;
        case 'legal':    Linking.openURL(`${WEB_URL}/legal`); break;
        case 'privacy':  Linking.openURL(`${WEB_URL}/politique-de-confidentialite`); break;
        case 'logout':   logout(); router.replace('/(auth)/welcome'); break;
      }
    }, 260);
  };

  const showSheet = () => {
    setShowServiceSheet(true);
    Animated.spring(bottomSheetAnim, { toValue: 1, useNativeDriver: true, tension: 65, friction: 11 }).start();
  };

  const hideSheet = () => {
    Animated.timing(bottomSheetAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => setShowServiceSheet(false));
  };

  const handleInstant = () => {
    if (!selectedService) { Alert.alert('Choisissez une prestation'); return; }
    hideSheet();
    router.push({ pathname: '/booking', params: { serviceType: selectedService, missionType: 'INSTANT' } });
  };

  const handleBook = () => {
    if (!selectedService) { Alert.alert('Choisissez une prestation'); return; }
    hideSheet();
    router.push({ pathname: '/booking', params: { serviceType: selectedService, missionType: 'BOOKING' } });
  };

  const sheetTranslateY = bottomSheetAnim.interpolate({ inputRange: [0, 1], outputRange: [500, 0] });

  const handleRecenter = () => {
    if (!userLocation) return;
    const newRegion = { ...userLocation, latitudeDelta: 0.04, longitudeDelta: 0.04 };
    mapRef.current?.animateToRegion(newRegion, 600);
    setShowRecenter(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Google Maps */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Constants.appOwnership === 'expo' ? undefined : PROVIDER_GOOGLE}
        initialRegion={region}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
        onPanDrag={() => { if (!showRecenter) setShowRecenter(true); }}
      >
        {userLocation && (
          <Marker coordinate={userLocation} title="Ma position" />
        )}
      </MapView>

      {/* Recenter button */}
      {showRecenter && userLocation && (
        <TouchableOpacity
          style={[styles.recenterBtn, { bottom: insets.bottom + 100 }]}
          onPress={handleRecenter}
          activeOpacity={0.8}
        >
          <Text style={styles.recenterIcon}>⊕</Text>
        </TouchableOpacity>
      )}

      {/* Top bar */}
      <View style={[styles.topBar, { top: insets.top + 12 }]}>
        <TouchableOpacity style={styles.hamburger} onPress={openDrawer} activeOpacity={0.75}>
          <View style={styles.hamLine} />
          <View style={[styles.hamLine, { width: 18 }]} />
          <View style={styles.hamLine} />
        </TouchableOpacity>
        <View style={styles.greeting}>
          <Text style={styles.greetingText}>
            Bonjour{user?.name ? ', ' + user.name.split(' ')[0] : ''} 👋
          </Text>
          <Text style={styles.greetingSubtitle}>Ou lavons-nous votre voiture ?</Text>
        </View>
        <LangToggle />
      </View>

      {/* Bouton Trouver un washer */}
      <View style={[styles.bottomActions, { bottom: insets.bottom + 24 }]}>
        <TouchableOpacity style={styles.findBtn} onPress={showSheet} activeOpacity={0.85}>
          <Text style={styles.findBtnText}>⚡  Trouver un washer</Text>
        </TouchableOpacity>
      </View>

      {/* Overlay */}
      {showServiceSheet && (
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={hideSheet} />
      )}

      {/* Bottom Sheet */}
      {showServiceSheet && (
        <Animated.View style={[styles.bottomSheet, { transform: [{ translateY: sheetTranslateY }], paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Choisissez votre prestation</Text>
          <View style={styles.serviceGrid}>
            {SERVICE_OPTIONS.map(({ key, label, price, desc }) => (
              <TouchableOpacity
                key={key}
                style={[styles.serviceCard, selectedService === key && styles.serviceCardSelected]}
                onPress={() => setSelectedService(key)}
                activeOpacity={0.8}
              >
                <Text style={[styles.serviceLabel, selectedService === key && styles.selectedText]}>{label}</Text>
                <Text style={[styles.servicePrice, selectedService === key && styles.selectedPriceText]}>{price} F</Text>
                <Text style={styles.serviceDesc}>{desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.sheetActions}>
            <TouchableOpacity style={[styles.sheetBtn, styles.instantBtn, !selectedService && styles.btnDisabled]} onPress={handleInstant} activeOpacity={0.85}>
              <Text style={styles.sheetBtnTextWhite}>⚡  Maintenant</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.sheetBtn, styles.bookBtn, !selectedService && styles.btnDisabled]} onPress={handleBook} activeOpacity={0.85}>
              <Text style={styles.sheetBtnTextBlue}>📅  Reserver</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Drawer */}
      {drawerOpen && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <TouchableWithoutFeedback onPress={closeDrawer}>
            <Animated.View style={[styles.drawerOverlay, { opacity: drawerOverlay }]} />
          </TouchableWithoutFeedback>
          <Animated.View style={[styles.drawer, { transform: [{ translateX: drawerAnim }], paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
            <View style={styles.drawerHeader}>
              <View style={styles.drawerAvatar}>
                <Text style={styles.drawerAvatarText}>{user?.name ? user.name[0].toUpperCase() : 'W'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.drawerName}>{user?.name || 'Utilisateur'}</Text>
                <Text style={styles.drawerPhone}>{user?.phone || 'Washapp'}</Text>
              </View>
              <TouchableOpacity onPress={closeDrawer} style={styles.closeBtn} activeOpacity={0.7}>
                <Text style={styles.closeBtnText}>X</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.drawerDivider} />
            <View style={styles.drawerMenu}>
              {MENU_ITEMS.map((item, i) => (
                <View key={item.action}>
                  {i === MENU_ITEMS.length - 1 && <View style={styles.drawerDivider} />}
                  <TouchableOpacity
                    style={[styles.drawerItem, item.action === 'logout' && styles.drawerItemLogout]}
                    onPress={() => handleMenuAction(item.action)}
                    activeOpacity={0.65}
                  >
                    <Text style={styles.drawerItemIcon}>{item.icon}</Text>
                    <Text style={[styles.drawerItemLabel, item.action === 'logout' && styles.drawerItemLabelLogout]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            <View style={{ flex: 1 }} />
            <Text style={styles.drawerVersion}>Washapp v1.0</Text>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },

  topBar: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  hamburger: { width: 46, height: 46, backgroundColor: '#fff', borderRadius: 14, alignItems: 'center', justifyContent: 'center', gap: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 10, elevation: 6 },
  hamLine: { width: 22, height: 2.5, backgroundColor: '#0f172a', borderRadius: 2 },
  greeting: { flex: 1, backgroundColor: '#fff', borderRadius: 18, paddingHorizontal: 16, paddingVertical: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.10, shadowRadius: 12, elevation: 6 },
  greetingText: { fontSize: 15, fontWeight: '600', color: '#0f172a' },
  greetingSubtitle: { fontSize: 12, color: '#94a3b8', marginTop: 1 },

  bottomActions: { position: 'absolute', left: 16, right: 16 },
  findBtn: { backgroundColor: '#1558f5', borderRadius: 18, paddingVertical: 18, alignItems: 'center', shadowColor: '#1558f5', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.45, shadowRadius: 14, elevation: 10 },
  findBtnText: { color: '#fff', fontWeight: '700', fontSize: 17 },

  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },

  bottomSheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 12, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.12, shadowRadius: 20, elevation: 20 },
  sheetHandle: { width: 40, height: 4, backgroundColor: '#e2e8f0', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 20, fontWeight: '700', color: '#0f172a', marginBottom: 18 },
  serviceGrid: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  serviceCard: { flex: 1, backgroundColor: '#f8fafc', borderRadius: 18, padding: 14, alignItems: 'center', borderWidth: 2, borderColor: '#f1f5f9', gap: 4 },
  serviceCardSelected: { borderColor: '#1558f5', backgroundColor: '#eff6ff' },
  serviceLabel: { fontSize: 13, fontWeight: '700', color: '#0f172a' },
  servicePrice: { fontSize: 12, color: '#64748b', fontWeight: '500' },
  serviceDesc: { fontSize: 10, color: '#94a3b8', textAlign: 'center' },
  selectedText: { color: '#1558f5' },
  selectedPriceText: { color: '#1558f5' },
  sheetActions: { flexDirection: 'row', gap: 12 },
  sheetBtn: { flex: 1, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  instantBtn: { backgroundColor: '#1558f5' },
  bookBtn: { backgroundColor: '#eff6ff', borderWidth: 2, borderColor: '#1558f5' },
  btnDisabled: { opacity: 0.4 },
  sheetBtnTextWhite: { fontWeight: '600', fontSize: 15, color: '#fff' },
  sheetBtnTextBlue: { fontWeight: '600', fontSize: 15, color: '#1558f5' },

  drawerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15,23,42,0.55)' },
  drawer: { position: 'absolute', top: 0, left: 0, bottom: 0, width: DRAWER_WIDTH, backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 6, height: 0 }, shadowOpacity: 0.18, shadowRadius: 20, elevation: 24, paddingHorizontal: 24 },
  drawerHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 22 },
  drawerAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#1558f5', alignItems: 'center', justifyContent: 'center' },
  drawerAvatarText: { fontSize: 20, fontWeight: '700', color: '#fff' },
  drawerName: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  drawerPhone: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  closeBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { fontSize: 13, color: '#64748b', fontWeight: '700' },
  drawerDivider: { height: 1, backgroundColor: '#f1f5f9', marginBottom: 12 },
  drawerMenu: { gap: 2 },
  drawerItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 13, paddingHorizontal: 10, borderRadius: 14 },
  drawerItemLogout: { marginTop: 4, backgroundColor: '#fef2f2' },
  drawerItemIcon: { fontSize: 18, width: 26, textAlign: 'center' },
  drawerItemLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: '#1e293b' },
  drawerItemLabelLogout: { color: '#dc2626', fontWeight: '600' },
  drawerVersion: { fontSize: 11, color: '#cbd5e1', textAlign: 'center' },

  recenterBtn: {
    position: 'absolute',
    right: 16,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
  },
  recenterIcon: { fontSize: 24, color: '#1558f5', lineHeight: 28 },
});