import { useState, useEffect, useRef, useCallback } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions,
  Alert, Linking, Platform, StatusBar, Image, Modal, ScrollView,
} from "react-native";
import Constants from 'expo-constants';
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { washerSocket, MissionData } from "../../services/socket";
import { washerApi, authApi } from "../../services/api";
import { useAuthStore } from "../../store";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { height } = Dimensions.get("window");
const WEB_URL = "http://localhost:3000";

type MapState = "OFFLINE" | "ONLINE_FREE" | "MISSION_INCOMING" | "MISSION_ACCEPTED" | "MISSION_IN_PROGRESS";

const SERVICE_LABELS: Record<string, string> = {
  EXTERIOR: "Lavage Exterieur", INTERIOR: "Lavage Interieur", FULL: "Lavage Complet",
};
const SERVICE_ICON: Record<string, string> = {
  EXTERIOR: "Ext.", INTERIOR: "Int.", FULL: "Full",
};

const MENU_ITEMS = [
  { icon: "\uD83C\uDFE0", label: "Accueil",         route: null },
  { icon: "\uD83D\uDCC5", label: "Mes missions",     route: "/(tabs)/missions" },
  { icon: "\uD83D\uDCB0", label: "Revenus",          route: "/(tabs)/earnings" },
  { icon: "\uD83D\uDCB3", label: "Wallet",           route: "/(tabs)/wallet" },
  { icon: "\uD83D\uDC64", label: "Mon compte",       route: "/(tabs)/account" },
  { icon: "\uD83D\uDCCB", label: "FAQ",              route: null, web: `${WEB_URL}/faq` },
  { icon: "\uD83D\uDCC4", label: "Mentions legales", route: null, web: `${WEB_URL}/legal` },
  { icon: "\uD83D\uDD12", label: "Politique de confidentialite", route: null, web: `${WEB_URL}/politique-de-confidentialite` },
  { icon: "\uD83D\uDEAA", label: "Deconnexion",      route: "LOGOUT" },
];

// Helper component: row info inside the mission card
function McInfoRow({ icon, value }: { icon: string; value: string }) {
  return (
    <View style={mcRowStyle.row}>
      <Text style={mcRowStyle.icon}>{icon}</Text>
      <Text style={mcRowStyle.text} numberOfLines={2}>{value}</Text>
    </View>
  );
}
const mcRowStyle = StyleSheet.create({
  row:  { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingVertical: 5 },
  icon: { fontSize: 13, marginTop: 1, width: 20, textAlign: "center", color: "#374151" },
  text: { flex: 1, fontSize: 14, color: "#374151", fontWeight: "500", lineHeight: 20 },
});

export default function MapScreen() {
  const router    = useRouter();
  const insets    = useSafeAreaInsets();
  const mapRef    = useRef<MapView>(null);
  const panelAnim = useRef(new Animated.Value(400)).current;
  const drawerAnim = useRef(new Animated.Value(-280)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const { user, clearAuth } = useAuthStore();

  const [mapState, setMapState] = useState<MapState>("OFFLINE");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mission, setMission]   = useState<MissionData | null>(null);
  const [activeMission, setActiveMission] = useState<any>(null);
  const [countdown, setCountdown]  = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [missionTimer, setMissionTimer] = useState<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Get current location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") { Alert.alert("Permission GPS refusee"); return; }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    })();
  }, []);

  // Socket: incoming mission
  useEffect(() => {
    const unsub = washerSocket.onMission((data: MissionData) => {
      setMission(data);
      setCountdown(data.timeoutSeconds);
      setMapState("MISSION_INCOMING");
      slidePanel(true);
    });
    return unsub;
  }, []);

  // Countdown timer for incoming mission
  useEffect(() => {
    if (mapState !== "MISSION_INCOMING" || countdown <= 0) return;
    const t = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(t);
          autoDecline();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [mapState, countdown]);

  // Check for active mission on load
  useEffect(() => {
    washerApi.getActiveMission()
      .then(r => {
        if (r.data) {
          setActiveMission(r.data);
          if (r.data.status === "ACCEPTED")     { setMapState("MISSION_ACCEPTED"); slidePanel(true); }
          if (r.data.status === "IN_PROGRESS")  { setMapState("MISSION_IN_PROGRESS"); slidePanel(true); startMissionTimer(); }
        }
      })
      .catch(() => {});
  }, []);

  const slidePanel = (show: boolean) => {
    Animated.spring(panelAnim, {
      toValue: show ? 0 : 400,
      useNativeDriver: true,
      tension: 65, friction: 10,
    }).start();
  };

  const openDrawer = () => {
    setDrawerOpen(true);
    Animated.parallel([
      Animated.spring(drawerAnim,  { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }),
      Animated.timing(overlayAnim, { toValue: 0.5, duration: 250, useNativeDriver: true }),
    ]).start();
  };

  const closeDrawer = () => {
    Animated.parallel([
      Animated.spring(drawerAnim,  { toValue: -280, useNativeDriver: true, tension: 80, friction: 12 }),
      Animated.timing(overlayAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(() => setDrawerOpen(false));
  };

  const toggleOnline = async () => {
    if (!location) { Alert.alert("GPS requis", "Activez votre localisation."); return; }
    if (mapState === "OFFLINE") {
      washerSocket.goOnline(location.lat, location.lng);
      setMapState("ONLINE_FREE");
    } else {
      washerSocket.goOffline();
      setMapState("OFFLINE");
      slidePanel(false);
    }
  };

  const acceptMission = () => {
    if (!mission) return;
    washerSocket.acceptMission(mission.missionId);
    setActiveMission({ ...mission, id: mission.missionId, status: "ACCEPTED", clientName: "Client" });
    setMapState("MISSION_ACCEPTED");
    setMission(null);
  };

  const declineMission = () => {
    if (!mission) return;
    washerSocket.declineMission(mission.missionId);
    setMission(null);
    setMapState("ONLINE_FREE");
    slidePanel(false);
  };

  const autoDecline = useCallback(() => {
    if (mission) washerSocket.declineMission(mission.missionId);
    setMission(null);
    setMapState("ONLINE_FREE");
    slidePanel(false);
  }, [mission]);

  const startMission = () => {
    if (!activeMission) return;
    washerSocket.start(activeMission.id || activeMission.missionId);
    setMapState("MISSION_IN_PROGRESS");
    startMissionTimer();
  };

  const startMissionTimer = () => {
    setMissionTimer(0);
    timerRef.current = setInterval(() => setMissionTimer(t => t + 1), 1000);
  };

  const completeMission = () => {
    if (!activeMission) return;
    Alert.alert("Terminer la mission", "Etes-vous sur d'avoir termine ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Oui, terminer",
        onPress: () => {
          washerSocket.complete(activeMission.id || activeMission.missionId);
          if (timerRef.current) clearInterval(timerRef.current);
          router.push(`/mission/${activeMission.id || activeMission.missionId}`);
          setActiveMission(null);
          setMapState("ONLINE_FREE");
          slidePanel(false);
        },
      },
    ]);
  };

  const handleLogout = async () => {
    closeDrawer();
    washerSocket.goOffline();
    washerSocket.disconnect();
    const rt = await AsyncStorage.getItem("refreshToken");
    if (rt) authApi.logout(rt).catch(() => {});
    await AsyncStorage.multiRemove(["accessToken", "refreshToken", "user"]);
    clearAuth();
    router.replace("/(auth)/welcome");
  };

  const handleMenuPress = (item: typeof MENU_ITEMS[0]) => {
    closeDrawer();
    setTimeout(() => {
      if (item.route === "LOGOUT") { handleLogout(); return; }
      if (item.web)  { Linking.openURL(item.web); return; }
      if (item.route) router.push(item.route as any);
    }, 250);
  };

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
  };

  const region = location
    ? { latitude: location.lat, longitude: location.lng, latitudeDelta: 0.02, longitudeDelta: 0.02 }
    : { latitude: 5.3599517, longitude: -4.0082563, latitudeDelta: 0.05, longitudeDelta: 0.05 };

  const isOnline = mapState !== "OFFLINE";

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* MAP */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        provider={Constants.appOwnership === 'expo' ? undefined : PROVIDER_GOOGLE}
        initialRegion={region}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={false}
      >
        {activeMission && (
          <Marker
            coordinate={{ latitude: activeMission.lat || 5.36, longitude: activeMission.lng || -4.00 }}
            title="Client"
            pinColor="#1558f5"
          />
        )}
      </MapView>

      {/* TOP OVERLAY */}
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        {/* Hamburger */}
        <TouchableOpacity style={styles.hamburger} onPress={openDrawer} activeOpacity={0.85}>
          <View style={styles.hLine} />
          <View style={[styles.hLine, { width: 18 }]} />
          <View style={styles.hLine} />
        </TouchableOpacity>

        {/* Status badge */}
        <View style={[styles.statusBadge, isOnline ? styles.statusOnline : styles.statusOffline]}>
          <View style={[styles.statusDot, isOnline ? styles.dotOnline : styles.dotOffline]} />
          <Text style={[styles.statusText, isOnline ? styles.statusTextOn : styles.statusTextOff]}>
            {mapState === "MISSION_IN_PROGRESS" ? "Mission en cours"
              : mapState === "MISSION_ACCEPTED"  ? "Mission acceptee"
              : mapState === "MISSION_INCOMING"  ? "Nouvelle mission !"
              : isOnline ? "En ligne" : "Hors ligne"}
          </Text>
        </View>

        {/* Logo */}
        <Image
          source={require("../../assets/images/logowashapp.png")}
          style={styles.topLogo}
          resizeMode="contain"
        />
      </View>

      {/* ONLINE / OFFLINE TOGGLE */}
      {(mapState === "OFFLINE" || mapState === "ONLINE_FREE") && (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity
            style={styles.onlineBtn}
            onPress={toggleOnline}
            activeOpacity={0.85}
          >
            <Text style={styles.onlineBtnText}>
              {isOnline ? "Se deconnecter" : "Se connecter"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* FREE STATE MESSAGE */}
      {mapState === "ONLINE_FREE" && (
        <View style={styles.freeMsg}>
          <Text style={styles.freeMsgText}>
            {"[OK] Vous etes en ligne. Les missions apparaitront ici."}
          </Text>
        </View>
      )}

      {/* BOTTOM PANEL */}
      <Animated.View style={[styles.panel, { transform: [{ translateY: panelAnim }] }]}>

        {/* MISSION INCOMING */}
        {mapState === "MISSION_INCOMING" && mission && (
          <View style={styles.missionCard}>
            {/* Top row */}
            <View style={styles.mcTopRow}>
              <TouchableOpacity style={styles.mcCloseBtn} onPress={declineMission} activeOpacity={0.8}>
                <Text style={styles.mcCloseTxt}>{"X"}</Text>
              </TouchableOpacity>
              <View style={{ flex: 1, alignItems: "center" }}>
                <Text style={styles.mcTitle}>Nouvelle mission</Text>
              </View>
              <View style={styles.mcCountdown}>
                <Text style={styles.mcCountdownTxt}>{countdown}s</Text>
              </View>
            </View>

            {/* Type badge */}
            <View style={styles.mcBadgeRow}>
              <View style={[styles.mcBadge, { backgroundColor: mission.serviceType === "FULL" ? "#fef3c7" : "#eff6ff" }]}>
                <Text style={styles.mcBadgeIcon}>{SERVICE_ICON[mission.serviceType]}</Text>
                <Text style={[styles.mcBadgeText, { color: mission.serviceType === "FULL" ? "#92400e" : "#1558f5" }]}>
                  {SERVICE_LABELS[mission.serviceType]}
                </Text>
              </View>
              {mission.type === "BOOKING" && (
                <View style={[styles.mcBadge, { backgroundColor: "#f0fdf4" }]}>
                  <Text style={[styles.mcBadgeText, { color: "#059669" }]}>{"Reservation"}</Text>
                </View>
              )}
            </View>

            {/* Price */}
            <Text style={styles.mcPrice}>{mission.price.toLocaleString("fr-FR")} <Text style={styles.mcPriceCur}>FCFA</Text></Text>

            {/* Distance row */}
            <View style={styles.mcDistRow}>
              <View style={styles.mcDistChip}>
                <Text style={styles.mcDistIcon}>{"~"}</Text>
                <Text style={styles.mcDistText}>
                  {location
                    ? (() => {
                        const R = 6371;
                        const dLat = (mission.lat - location.lat) * Math.PI / 180;
                        const dLng = (mission.lng - location.lng) * Math.PI / 180;
                        const a = Math.sin(dLat/2)**2 + Math.cos(location.lat*Math.PI/180)*Math.cos(mission.lat*Math.PI/180)*Math.sin(dLng/2)**2;
                        const km = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                        const mins = Math.max(2, Math.round(km / 0.35));
                        return `${mins} min - ${km.toFixed(1)} km`;
                      })()
                    : "Calcul en cours..."}
                </Text>
              </View>
            </View>

            {/* Divider */}
            <View style={styles.mcDivider} />

            {/* Infos list */}
            <View style={styles.mcInfoList}>
              <McInfoRow icon={"[A]"} value={mission.address} />
              {mission.scheduledAt ? (
                <McInfoRow
                  icon={"[D]"}
                  value={new Date(mission.scheduledAt).toLocaleString("fr-FR", {
                    weekday: "short", day: "numeric", month: "short",
                    hour: "2-digit", minute: "2-digit",
                  })}
                />
              ) : (
                <McInfoRow icon={"[!]"} value={"Maintenant - mission instantanee"} />
              )}
              {(mission as any).vehiclePlate && (
                <McInfoRow icon={"[V]"} value={(mission as any).vehiclePlate} />
              )}
              {(mission as any).instructions && (
                <McInfoRow icon={"[N]"} value={(mission as any).instructions} />
              )}
            </View>

            {/* CTA */}
            <TouchableOpacity style={styles.mcAcceptBtn} onPress={acceptMission} activeOpacity={0.85}>
              <Text style={styles.mcAcceptTxt}>Accepter la mission</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* MISSION ACCEPTED */}
        {mapState === "MISSION_ACCEPTED" && activeMission && (
          <View style={styles.panelContent}>
            <View style={styles.panelHandle} />
            <Text style={styles.panelTag}>{"Mission confirmee"}</Text>
            <Text style={styles.missionTitle}>{SERVICE_LABELS[activeMission.serviceType] || "Mission"}</Text>
            <View style={styles.missionInfoRow}>
              <Text style={styles.missionInfo}>{"[A] "}{activeMission.address || activeMission.fullAddress}</Text>
            </View>
            <View style={styles.panelActions}>
              <TouchableOpacity
                style={styles.callBtn}
                onPress={() => { if (activeMission.clientPhone) Linking.openURL(`tel:${activeMission.clientPhone}`); }}
                activeOpacity={0.85}
              >
                <Text style={styles.callBtnText}>{"[T] Appeler"}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.startBtn} onPress={startMission} activeOpacity={0.85}>
                <Text style={styles.startBtnText}>{"Demarrer"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* MISSION IN PROGRESS */}
        {mapState === "MISSION_IN_PROGRESS" && activeMission && (
          <View style={styles.panelContent}>
            <View style={styles.panelHandle} />
            <View style={styles.inProgressHeader}>
              <Text style={styles.panelTag}>{"Mission en cours"}</Text>
              <Text style={styles.timerText}>{formatTimer(missionTimer)}</Text>
            </View>
            <Text style={styles.missionTitle}>{SERVICE_LABELS[activeMission.serviceType] || "Mission"}</Text>
            <TouchableOpacity
              style={[styles.startBtn, { backgroundColor: "#059669", marginTop: 16 }]}
              onPress={completeMission}
              activeOpacity={0.85}
            >
              <Text style={styles.startBtnText}>{"Mission terminee"}</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>

      {/* DRAWER */}
      {drawerOpen && (
        <>
          <Animated.View style={[styles.drawerOverlay, { opacity: overlayAnim }]}>
            <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={closeDrawer} activeOpacity={1} />
          </Animated.View>
          <Animated.View
            style={[styles.drawer, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20,
              transform: [{ translateX: drawerAnim }] }]}
          >
            {/* Drawer header */}
            <View style={styles.drawerHeader}>
              <Image
                source={require("../../assets/images/logowashapp.png")}
                style={{ width: 36, height: 36, borderRadius: 9 }}
                resizeMode="contain"
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.drawerName}>{user?.firstName ?? "Washer"} {user?.lastName ?? ""}</Text>
                <Text style={styles.drawerRole}>Washer Washapp</Text>
              </View>
            </View>

            <View style={styles.drawerDivider} />

            <ScrollView showsVerticalScrollIndicator={false}>
              {MENU_ITEMS.map((item, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.drawerItem, item.label === "Deconnexion" && { marginTop: 16 }]}
                  onPress={() => handleMenuPress(item)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.drawerItemIcon}>{item.icon}</Text>
                  <Text style={[styles.drawerItemLabel, item.label === "Deconnexion" && { color: "#ef4444" }]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },

  topBar: {
    position: "absolute", top: 0, left: 0, right: 0,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 12, zIndex: 10,
  },
  hamburger: {
    width: 46, height: 46, backgroundColor: "#fff", borderRadius: 14,
    alignItems: "center", justifyContent: "center", gap: 5,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  hLine: { width: 22, height: 2.5, backgroundColor: "#0f172a", borderRadius: 2 },
  statusBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 3,
  },
  statusOnline:  { backgroundColor: "#ecfdf5" },
  statusOffline: { backgroundColor: "#fff" },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  dotOnline:  { backgroundColor: "#059669" },
  dotOffline: { backgroundColor: "#94a3b8" },
  statusText: { fontSize: 12, fontWeight: "700" },
  statusTextOn:  { color: "#059669" },
  statusTextOff: { color: "#64748b" },
  topLogo: { width: 36, height: 36, borderRadius: 9 },

  bottomBar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    paddingHorizontal: 20, paddingTop: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1, borderTopColor: "#f1f5f9",
    shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 8,
    zIndex: 5,
  },
  onlineBtn: {
    backgroundColor: "#1558f5", borderRadius: 16, paddingVertical: 17, alignItems: "center",
    shadowColor: "#1558f5", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 8,
  },
  onlineBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },

  freeMsg: {
    position: "absolute", bottom: 130, left: 20, right: 20,
    backgroundColor: "#fff", borderRadius: 16, padding: 14,
    alignItems: "center", zIndex: 5,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  freeMsgText: { fontSize: 13, fontWeight: "600", color: "#374151", textAlign: "center" },

  panel: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: "#fff", borderTopLeftRadius: 28, borderTopRightRadius: 28,
    shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.12, shadowRadius: 20, elevation: 20,
    zIndex: 10,
  },
  panelContent: { padding: 24, paddingBottom: 36, gap: 10 },
  panelHandle: {
    width: 40, height: 4, backgroundColor: "#e2e8f0", borderRadius: 2,
    alignSelf: "center", marginBottom: 8,
  },
  panelHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  panelTag:  { fontSize: 12, fontWeight: "700", color: "#64748b", textTransform: "uppercase" },
  countdownBadge: { backgroundColor: "#fef2f2", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  countdownText: { color: "#ef4444", fontWeight: "800", fontSize: 14 },
  missionTitle: { fontSize: 22, fontWeight: "900", color: "#0f172a" },
  missionInfoRow: { flexDirection: "row", alignItems: "center" },
  missionInfo: { fontSize: 14, color: "#374151", fontWeight: "500" },

  inProgressHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  timerText: { fontSize: 22, fontWeight: "900", color: "#1558f5", fontVariant: ["tabular-nums" as any] },

  panelActions: { flexDirection: "row", gap: 12, marginTop: 8 },
  refuseBtn: {
    flex: 1, paddingVertical: 16, borderRadius: 16, alignItems: "center",
    backgroundColor: "#fef2f2", borderWidth: 1.5, borderColor: "#fecaca",
  },
  refuseBtnText: { color: "#ef4444", fontWeight: "800", fontSize: 15 },
  acceptBtn: {
    flex: 2, paddingVertical: 16, borderRadius: 16, alignItems: "center",
    backgroundColor: "#1558f5",
    shadowColor: "#1558f5", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
  },
  acceptBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  callBtn: {
    flex: 1, paddingVertical: 16, borderRadius: 16, alignItems: "center",
    backgroundColor: "#f0fdf4", borderWidth: 1.5, borderColor: "#bbf7d0",
  },
  callBtnText: { color: "#059669", fontWeight: "800", fontSize: 14 },
  startBtn: {
    flex: 2, paddingVertical: 16, borderRadius: 16, alignItems: "center",
    backgroundColor: "#1558f5",
    shadowColor: "#1558f5", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
  },
  startBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },

  drawerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
    zIndex: 20,
  },
  drawer: {
    position: "absolute", top: 0, left: 0, bottom: 0, width: 280,
    backgroundColor: "#fff", zIndex: 30,
    shadowColor: "#000", shadowOffset: { width: 4, height: 0 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 20,
  },
  drawerHeader: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 20, marginBottom: 16 },
  drawerName: { fontSize: 16, fontWeight: "800", color: "#0f172a" },
  drawerRole: { fontSize: 12, color: "#64748b", fontWeight: "500", marginTop: 2 },
  drawerDivider: { height: 1, backgroundColor: "#f1f5f9", marginBottom: 8 },
  drawerItem: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 20, paddingVertical: 14 },
  drawerItemIcon: { fontSize: 14, color: "#374151" },
  drawerItemLabel: { fontSize: 15, fontWeight: "600", color: "#0f172a" },

  missionCard: {
    padding: 20, paddingBottom: 28, gap: 6,
  },
  mcTopRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  mcCloseBtn: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: "#f1f5f9",
    alignItems: "center", justifyContent: "center",
  },
  mcCloseTxt: { fontSize: 16, color: "#64748b", fontWeight: "700" },
  mcTitle: { fontSize: 16, fontWeight: "800", color: "#0f172a" },
  mcCountdown: {
    backgroundColor: "#fef2f2", paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 10,
  },
  mcCountdownTxt: { color: "#ef4444", fontWeight: "800", fontSize: 14 },
  mcBadgeRow: { flexDirection: "row", gap: 8, marginBottom: 4 },
  mcBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  mcBadgeIcon: { fontSize: 12, fontWeight: "700", color: "#374151" },
  mcBadgeText: { fontSize: 12, fontWeight: "700" },
  mcPrice: { fontSize: 36, fontWeight: "900", color: "#0f172a", letterSpacing: -1, marginVertical: 4 },
  mcPriceCur: { fontSize: 18, fontWeight: "700", color: "#64748b" },
  mcDistRow: { flexDirection: "row", marginBottom: 4 },
  mcDistChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#eff6ff", paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
  },
  mcDistIcon: { fontSize: 14, color: "#1558f5" },
  mcDistText: { fontSize: 13, fontWeight: "700", color: "#1558f5" },
  mcDivider: { height: 1, backgroundColor: "#f1f5f9", marginVertical: 8 },
  mcInfoList: { gap: 0 },
  mcAcceptBtn: {
    backgroundColor: "#1558f5", borderRadius: 16, paddingVertical: 18,
    alignItems: "center", marginTop: 12,
    shadowColor: "#1558f5", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 10,
  },
  mcAcceptTxt: { color: "#fff", fontWeight: "800", fontSize: 16 },
});