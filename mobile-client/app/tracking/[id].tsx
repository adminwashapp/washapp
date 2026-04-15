import { useState, useEffect, useRef, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, Animated, Linking, Image, Platform, Dimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import Constants from "expo-constants";
import { missionsApi } from "../../services/api";
import { connectSocket } from "../../services/socket";

const { height: SCREEN_H } = Dimensions.get("window");
const GOOGLE_KEY = "AIzaSyCeTFxCeQDH9m6lhWNl0OIyFGPZo5iFxCk";
const IS_EXPO_GO = Constants.appOwnership === "expo";

function decodePolyline(encoded: string): { latitude: number; longitude: number }[] {
  const pts: { latitude: number; longitude: number }[] = [];
  let index = 0, lat = 0, lng = 0;
  while (index < encoded.length) {
    let b, shift = 0, result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lat += (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    shift = 0; result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lng += (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    pts.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return pts;
}

async function fetchRoute(oLat: number, oLng: number, dLat: number, dLng: number) {
  try {
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${oLat},${oLng}&destination=${dLat},${dLng}&mode=driving&language=fr&key=${GOOGLE_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.routes?.[0]) {
      const leg = data.routes[0].legs[0];
      const coords = decodePolyline(data.routes[0].overview_polyline.points);
      return { coords, duration: leg.duration?.text ?? "", distance: leg.distance?.text ?? "" };
    }
  } catch {}
  return null;
}

const SERVICE_LABELS: Record<string, string> = {
  EXTERIOR: "Lavage Ext\u00E9rieur", INTERIOR: "Lavage Int\u00E9rieur", FULL: "Lavage Complet",
};
const SERVICE_EMOJI: Record<string, string> = {
  EXTERIOR: "\uD83D\uDEB9", INTERIOR: "\u2728", FULL: "\u2B50",
};

type Status = "SEARCHING"|"ASSIGNED"|"EN_ROUTE"|"ARRIVED"|"IN_PROGRESS"|"COMPLETED"|"VALIDATED"|"CANCELLED";

const STEPS: { key: Status[]; label: string; icon: string }[] = [
  { key: ["SEARCHING"],             label: "Recherche",  icon: "\uD83D\uDD0D" },
  { key: ["ASSIGNED","EN_ROUTE"],  label: "En route",   icon: "\uD83D\uDEF5" },
  { key: ["ARRIVED"],               label: "Arriv\u00E9",     icon: "\uD83D\uDCCD" },
  { key: ["IN_PROGRESS"],           label: "En cours",   icon: "\u2728" },
  { key: ["COMPLETED","VALIDATED"], label: "Termin\u00E9",    icon: "\u2705" },
];

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  SEARCHING:   { label: "Recherche d'un washer...",     color: "#d97706", bg: "#fffbeb" },
  ASSIGNED:    { label: "Washer trouv\u00E9 !",         color: "#1558f5", bg: "#eff6ff" },
  EN_ROUTE:    { label: "Washer en route vers vous",    color: "#1558f5", bg: "#eff6ff" },
  ARRIVED:     { label: "Washer arriv\u00E9 chez vous", color: "#7c3aed", bg: "#f5f3ff" },
  IN_PROGRESS: { label: "Lavage en cours...",           color: "#7c3aed", bg: "#f5f3ff" },
  COMPLETED:   { label: "Termin\u00E9 \u2014 \u00E0 valider", color: "#059669", bg: "#ecfdf5" },
  VALIDATED:   { label: "Mission valid\u00E9e",         color: "#059669", bg: "#ecfdf5" },
  CANCELLED:   { label: "Annul\u00E9e",                 color: "#ef4444", bg: "#fef2f2" },
};
export default function TrackingScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const { id }  = useLocalSearchParams<{ id: string }>();

  const [mission,       setMission]      = useState<any>(null);
  const [loading,       setLoading]      = useState(true);
  const [submitting,    setSubmitting]   = useState(false);
  const [showRating,    setShowRating]   = useState(false);
  const [showClaim,     setShowClaim]    = useState(false);
  const [rating,        setRating]       = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [claimText,     setClaimText]    = useState("");
  const [washerLoc, setWasherLoc]   = useState<{ lat: number; lng: number } | null>(null);
  const [routeCoords, setRouteCoords] = useState<{ latitude: number; longitude: number }[]>([]);
  const [eta, setEta]                = useState<{ duration: string; distance: string } | null>(null);

  const mapRef  = useRef<MapView>(null);
  const dotAnim = useRef(new Animated.Value(0)).current;
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (status !== "IN_PROGRESS") return;
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, [status]);

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(dotAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(dotAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  const fetchMission = useCallback(async () => {
    if (!id) return;
    try {
      const res = await missionsApi.getById(id);
      const m = res.data;
      setMission(m);
      if (m?.washer?.location) {
        setWasherLoc((prev) => prev ?? { lat: m.washer.location.lat, lng: m.washer.location.lng });
      }
    } catch {}
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => {
    fetchMission();
    const poll = setInterval(fetchMission, 10000);
    return () => clearInterval(poll);
  }, [fetchMission]);

  useEffect(() => {
    let mounted = true;
    connectSocket().then((sock) => {
      sock.on("washer:location-update", (data: { missionId: string; lat: number; lng: number }) => {
        if (!mounted) return;
        if (data.missionId === id) setWasherLoc({ lat: data.lat, lng: data.lng });
      });
      sock.on("mission:status", (data: { missionId: string; status: string }) => {
        if (data.missionId === id) fetchMission();
      });
    }).catch(() => {});
    return () => { mounted = false; };
  }, [id]);

  useEffect(() => {
    if (!washerLoc || !mission?.lat || !mission?.lng) return;
    fetchRoute(washerLoc.lat, washerLoc.lng, mission.lat, mission.lng).then((result) => {
      if (!result) return;
      setRouteCoords(result.coords);
      setEta({ duration: result.duration, distance: result.distance });
      mapRef.current?.fitToCoordinates(
        [
          { latitude: washerLoc.lat, longitude: washerLoc.lng },
          { latitude: mission.lat, longitude: mission.lng },
        ],
        { edgePadding: { top: 60, right: 40, bottom: 40, left: 40 }, animated: true }
      );
    });
  }, [washerLoc, mission?.lat, mission?.lng]);

  const handleValidate = async () => {
    setSubmitting(true);
    try {
      await missionsApi.validate(id);
      await fetchMission();
      setShowRating(true);
    } catch (e: any) {
      Alert.alert("Erreur", e?.response?.data?.message || "Impossible de valider");
    } finally { setSubmitting(false); }
  };

  const handleRate = async () => {
    if (!rating) return;
    setSubmitting(true);
    try {
      await missionsApi.rate(id, { stars: rating, comment: ratingComment });
      setShowRating(false);
      await fetchMission();
    } finally { setSubmitting(false); }
  };

  const handleComplaint = async () => {
    if (!claimText.trim()) return;
    setSubmitting(true);
    try {
      await missionsApi.complain(id, { reason: claimText });
      setShowClaim(false);
      await fetchMission();
    } finally { setSubmitting(false); }
  };

  const openGPS = () => {
    if (!mission) return;
    const dest = mission.lat ? `${mission.lat},${mission.lng}` : encodeURIComponent(mission.fullAddress || "");
    const url = Platform.OS === "ios" ? `maps:?daddr=${dest}` : `google.navigation:q=${dest}`;
    Linking.openURL(url).catch(() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${dest}`));
  };

  if (loading) return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc", alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size="large" color="#1558f5" />
    </View>
  );
  if (!mission) return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc", alignItems: "center", justifyContent: "center", padding: 32 }}>
      <Text style={{ color: "#64748b", fontSize: 16 }}>Mission introuvable</Text>
      <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
        <Text style={{ color: "#1558f5", fontWeight: "700" }}>Retour</Text>
      </TouchableOpacity>
    </View>
  );

  const status: Status = mission.status ?? "SEARCHING";
  const meta   = STATUS_META[status] ?? STATUS_META.SEARCHING;
  const activeStepIdx = STEPS.findIndex((s) => s.key.includes(status));
  const washer = mission.washer;
  const destLat = mission.lat || 5.3599517;
  const destLng = mission.lng || -4.0082563;
  const showMap = ["ASSIGNED","EN_ROUTE","ARRIVED","IN_PROGRESS"].includes(status);
  const isInProgress = status === "IN_PROGRESS";
  const showEta = eta && washerLoc && ["ASSIGNED","EN_ROUTE"].includes(status);
  const mapRegion = { latitude: washerLoc?.lat ?? destLat, longitude: washerLoc?.lng ?? destLng, latitudeDelta: 0.04, longitudeDelta: 0.04 };
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <Text style={styles.backArrow}>{"\u2190"}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Suivi de mission</Text>
        <View style={[styles.statusPill, { backgroundColor: meta.bg }]}>
          <Animated.View style={[styles.statusDot, { backgroundColor: meta.color, opacity: dotAnim }]} />
          <Text style={[styles.statusPillText, { color: meta.color }]}>{meta.label}</Text>
        </View>
      </View>

      <View style={styles.progressBar}>
        {STEPS.map((step, i) => {
          const done = i < activeStepIdx;
          const active = i === activeStepIdx;
          return (
            <View key={step.label} style={styles.progressItem}>
              <View style={[styles.progressDot, done || active ? styles.dotActive : styles.dotInactive]}>
                {done ? <Text style={{ color: "#fff", fontSize: 9, fontWeight: "900" }}>{"\u2713"}</Text> : null}
                {active ? <View style={styles.dotInner} /> : null}
                {!done && !active ? <Text style={{ fontSize: 9, color: "#94a3b8" }}>{step.icon}</Text> : null}
              </View>
              <Text style={[styles.progressLabel, (done || active) ? styles.labelActive : {}]} numberOfLines={1}>{step.label}</Text>
              {i < STEPS.length - 1 && <View style={[styles.progressLine, done ? styles.lineActive : {}]} />}
            </View>
          );
        })}
      </View>

      <View style={[styles.mapContainer, { height: showMap ? SCREEN_H * 0.40 : 120 }]}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          provider={IS_EXPO_GO ? undefined : PROVIDER_GOOGLE}
          initialRegion={mapRegion}
          showsUserLocation={false}
          showsCompass={false}
          showsMyLocationButton={false}
          toolbarEnabled={false}
        >
          <Marker coordinate={{ latitude: destLat, longitude: destLng }} title="Votre adresse" pinColor="#1558f5" />
          {washerLoc && (
            <Marker coordinate={{ latitude: washerLoc.lat, longitude: washerLoc.lng }} title="Votre washer" anchor={{ x: 0.5, y: 0.5 }}>
              <View style={styles.washerMarker}>
                <Text style={styles.washerMarkerEmoji}>{"\uD83D\uDEF5"}</Text>
              </View>
            </Marker>
          )}
          {routeCoords.length > 1 && <Polyline coordinates={routeCoords} strokeColor="#1558f5" strokeWidth={4} geodesic />}
        </MapView>

        {showEta && (
          <View style={styles.etaBanner}>
            <Text style={styles.etaEmoji}>{"\uD83D\uDEF5"}</Text>
            <View>
              <Text style={styles.etaDuration}>{eta!.duration}</Text>
              <Text style={styles.etaDistance}>{eta!.distance}</Text>
            </View>
          </View>
        )}
        {!washerLoc && showMap && (
          <View style={styles.locatingBanner}>
            <ActivityIndicator size="small" color="#1558f5" />
            <Text style={styles.locatingText}>Localisation du washer...</Text>
          </View>
        )}
        <TouchableOpacity style={styles.gpsBtn} onPress={openGPS} activeOpacity={0.85}>
          <Text style={styles.gpsBtnText}>{"\uD83D\uDDFA\uFE0F"} Itin\u00E9raire</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {washer && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Votre washer</Text>
            <View style={styles.washerRow}>
              <View style={styles.washerAvatar}>
                {washer.photoUrl
                  ? <Image source={{ uri: washer.photoUrl }} style={StyleSheet.absoluteFillObject as any} borderRadius={30} />
                  : <Text style={styles.washerAvatarEmoji}>{"\uD83E\uDDCB"}</Text>
                }
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.washerName}>{washer.user?.name ?? "Washer"}</Text>
                {washer.averageRating ? (
                  <View style={styles.ratingRow}>
                    <Text>{"\u2B50"}</Text>
                    <Text style={styles.ratingVal}>{Number(washer.averageRating).toFixed(1)}</Text>
                    <Text style={styles.ratingCount}> ({washer.totalRatings ?? 0} avis)</Text>
                  </View>
                ) : null}
                {washer.zoneLabel ? <Text style={styles.washerZone}>{"\uD83D\uDCCD"} {washer.zoneLabel}</Text> : null}
              </View>
              {washer.user?.phone && (
                <TouchableOpacity style={styles.callBtn} onPress={() => Linking.openURL(`tel:${washer.user.phone}`)} activeOpacity={0.8}>
                  <Text style={styles.callEmoji}>{"\uD83D\uDCDE"}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>D\u00E9tails de la prestation</Text>
          <View style={styles.detailsGrid}>
            <DetailRow icon={SERVICE_EMOJI[mission.serviceType] ?? "\uD83D\uDE97"} label="Prestation" value={SERVICE_LABELS[mission.serviceType] ?? "\u2014"} />
            <DetailRow icon="\uD83D\uDCB0" label="Montant" value={`${(mission.price ?? 0).toLocaleString("fr-FR")} FCFA`} highlight />
            <DetailRow icon="\uD83D\uDCCD" label="Adresse" value={mission.fullAddress || "\u2014"} />
            {mission.scheduledAt && <DetailRow icon="\uD83D\uDD50" label="Heure pr\u00E9vue" value={new Date(mission.scheduledAt).toLocaleString("fr-FR", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} />}
            {mission.vehiclePlate && <DetailRow icon="\uD83D\uDE97" label="Plaque" value={mission.vehiclePlate} />}
          </View>
        </View>

        {mission.photos?.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Photos du lavage</Text>
            <View style={styles.photosRow}>
              {mission.photos.map((p: any) => (
                <View key={p.id ?? p.url} style={styles.photoWrap}>
                  <Image source={{ uri: p.url }} style={styles.photo} resizeMode="cover" />
                  <View style={[styles.photoBadge, p.type === "BEFORE" ? styles.photoBadgeBefore : styles.photoBadgeAfter]}>
                    <Text style={styles.photoBadgeText}>{p.type === "BEFORE" ? "AVANT" : "APR\u00C8S"}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {isInProgress && (
          <View style={styles.inProgressCard}>
            <View style={styles.inProgressHeader}>
              <Text style={styles.inProgressTitle}>Lavage en cours</Text>
              <View style={styles.timerBadge}>
                <Text style={styles.timerText}>
                  {String(Math.floor(elapsed/60)).padStart(2,"0")}:{String(elapsed%60).padStart(2,"0")}
                </Text>
              </View>
            </View>
            <Text style={styles.inProgressSub}>Votre washer nettoie votre vehicule avec soin</Text>
            <View style={styles.progressSteps}>
              {["Nettoyage exterieur","Rinçage","Sechage","Finitions"].map((step, i) => {
                const done = elapsed > (i+1)*90;
                const active = !done && elapsed > i*90;
                return (
                  <View key={step} style={styles.washStep}>
                    <View style={[styles.washStepDot, done ? styles.washDotDone : active ? styles.washDotActive : styles.washDotPending]}>
                      {done && <Text style={{color:"#fff",fontSize:10,fontWeight:"900"}}>v</Text>}
                      {active && <View style={styles.washDotInner}/>}
                    </View>
                    <Text style={[styles.washStepLabel, (done||active) && {color:"#1558f5",fontWeight:"700"}]}>{step}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {status === "COMPLETED" && (
          <View style={styles.validateBlock}>
            <Text style={styles.validateTitle}>Mission termin\u00E9e !</Text>
            <Text style={styles.validateSub}>Votre v\u00E9hicule est pr\u00EAt.</Text>
            {mission?.paymentMethod === "WAVE_MONEY" ? (
              <TouchableOpacity style={[styles.validateBtn, { backgroundColor: "#00b9f5" }]} onPress={() => router.replace({ pathname: "/wave-payment/[id]", params: { id: mission.id } })} activeOpacity={0.85}>
                <Text style={styles.validateBtnText}>{"\uD83D\uDCB3"}{"  "}Payer via Wave Money</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.validateBtn} onPress={handleValidate} disabled={submitting} activeOpacity={0.85}>
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.validateBtnText}>{"\u2705"} Confirmer la remise</Text>}
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.claimOpenBtn} onPress={() => setShowClaim(true)} activeOpacity={0.8}>
              <Text style={styles.claimOpenBtnText}>{"\u26A0\uFE0F"} Signaler un probl\u00E8me</Text>
            </TouchableOpacity>
          </View>
        )}

        {status === "VALIDATED" && !mission.rating && (
          <TouchableOpacity style={styles.rateOpenBtn} onPress={() => setShowRating(true)} activeOpacity={0.85}>
            <Text style={styles.rateOpenBtnText}>{"\u2B50"} Noter mon washer</Text>
          </TouchableOpacity>
        )}

        {status === "VALIDATED" && mission.rating && (
          <View style={styles.doneBlock}>
            <Text style={styles.doneEmoji}>{"\uD83C\uDFC6"}</Text>
            <Text style={styles.doneTitle}>Merci pour votre confiance !</Text>
            <Text style={styles.doneSub}>{"\u00C0"} tr\u00E8s bient\u00F4t sur Washapp.</Text>
          </View>
        )}

        <View style={{ height: insets.bottom + 32 }} />
      </ScrollView>
      {showRating && (
        <View style={styles.sheetOverlay}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Notez votre washer</Text>
            <Text style={styles.sheetSub}>Comment s{"'"}est pass\u00E9e la mission ?</Text>
            <View style={styles.starsRow}>
              {[1,2,3,4,5].map((s) => (
                <TouchableOpacity key={s} onPress={() => setRating(s)} style={styles.starBtn} activeOpacity={0.7}>
                  <Text style={[styles.star, s <= rating ? styles.starActive : {}]}>{s <= rating ? "\u2605" : "\u2606"}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {rating > 0 && <Text style={styles.ratingLabelText}>{rating === 5 ? "Excellent !" : rating === 4 ? "Tr\u00E8s bien" : rating === 3 ? "Bien" : rating === 2 ? "Peut mieux faire" : "D\u00E9cevant"}</Text>}
            <View style={styles.sheetActions}>
              <TouchableOpacity style={styles.sheetCancelBtn} onPress={() => setShowRating(false)} activeOpacity={0.8}>
                <Text style={styles.sheetCancelTxt}>Plus tard</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.sheetOkBtn, (!rating || submitting) && { opacity: 0.5 }]} onPress={handleRate} disabled={!rating || submitting} activeOpacity={0.85}>
                {submitting ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.sheetOkTxt}>Envoyer</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {showClaim && (
        <View style={styles.sheetOverlay}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Signaler un probl\u00E8me</Text>
            <Text style={styles.sheetSub}>D\u00E9crivez le probl\u00E8me rencontr\u00E9.</Text>
            <View style={styles.claimInput}>
              <Text style={{ color: "#94a3b8", fontSize: 14 }}>{claimText || "D\u00E9crivez le probl\u00E8me..."}</Text>
            </View>
            <View style={styles.sheetActions}>
              <TouchableOpacity style={styles.sheetCancelBtn} onPress={() => setShowClaim(false)} activeOpacity={0.8}>
                <Text style={styles.sheetCancelTxt}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.sheetOkBtn, { backgroundColor: "#ef4444" }, (!claimText.trim() || submitting) && { opacity: 0.5 }]} onPress={handleComplaint} disabled={!claimText.trim() || submitting} activeOpacity={0.85}>
                {submitting ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.sheetOkTxt}>Signaler</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

function DetailRow({ icon, label, value, highlight }: { icon: string; label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailIcon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={[styles.detailValue, highlight && { color: "#1558f5", fontWeight: "800" }]}>{value}</Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  backBtn: { width: 40, height: 40, backgroundColor: "#f1f5f9", borderRadius: 12, alignItems: "center", justifyContent: "center" },
  backArrow: { fontSize: 18, fontWeight: "700", color: "#0f172a" },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: "800", color: "#0f172a", textAlign: "center", marginHorizontal: 8 },
  statusPill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusPillText: { fontSize: 10, fontWeight: "800" },
  progressBar: { flexDirection: "row", backgroundColor: "#fff", paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  progressItem: { flex: 1, alignItems: "center", position: "relative" },
  progressDot: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  dotActive: { backgroundColor: "#1558f5" },
  dotInactive: { backgroundColor: "#e2e8f0" },
  dotInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#fff" },
  progressLabel: { fontSize: 9, fontWeight: "600", color: "#94a3b8", marginTop: 3, textAlign: "center" },
  labelActive: { color: "#1558f5" },
  progressLine: { position: "absolute", top: 11, left: "50%", right: "-50%", height: 2, backgroundColor: "#e2e8f0" },
  lineActive: { backgroundColor: "#1558f5" },
  mapContainer: { position: "relative", backgroundColor: "#e2e8f0" },
  washerMarker: { backgroundColor: "#fff", borderRadius: 24, width: 44, height: 44, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 5 },
  washerMarkerEmoji: { fontSize: 26 },
  etaBanner: { position: "absolute", bottom: 56, left: 16, right: 16, backgroundColor: "rgba(255,255,255,0.97)", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, flexDirection: "row", alignItems: "center", gap: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 5 },
  etaEmoji: { fontSize: 26 },
  etaDuration: { fontSize: 16, fontWeight: "800", color: "#1558f5" },
  etaDistance: { fontSize: 12, color: "#64748b", fontWeight: "500", marginTop: 1 },
  locatingBanner: { position: "absolute", bottom: 56, left: 16, right: 16, backgroundColor: "rgba(255,255,255,0.95)", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, flexDirection: "row", alignItems: "center", gap: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 4 },
  locatingText: { fontSize: 14, fontWeight: "600", color: "#64748b" },
  gpsBtn: { position: "absolute", top: 12, right: 12, backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 6, elevation: 4 },
  gpsBtnText: { fontSize: 13, fontWeight: "700", color: "#1558f5" },
  scroll: { padding: 16, gap: 14 },
  card: { backgroundColor: "#fff", borderRadius: 20, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3, gap: 14 },
  cardTitle: { fontSize: 11, fontWeight: "800", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.8 },
  washerRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  washerAvatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  washerAvatarEmoji: { fontSize: 28 },
  washerName: { fontSize: 17, fontWeight: "800", color: "#0f172a" },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  ratingVal: { fontSize: 13, fontWeight: "700", color: "#f59e0b" },
  ratingCount: { fontSize: 12, color: "#94a3b8" },
  washerZone: { fontSize: 12, color: "#64748b", marginTop: 3 },
  callBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#ecfdf5", alignItems: "center", justifyContent: "center" },
  callEmoji: { fontSize: 22 },
  detailsGrid: { gap: 10 },
  detailRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  detailIcon: { fontSize: 16, lineHeight: 22, width: 22, textAlign: "center" },
  detailLabel: { fontSize: 10, fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.3 },
  detailValue: { fontSize: 14, fontWeight: "600", color: "#0f172a", marginTop: 2, lineHeight: 20 },
  photosRow: { flexDirection: "row", gap: 12 },
  photoWrap: { flex: 1, height: 150, borderRadius: 14, overflow: "hidden" },
  photo: { width: "100%", height: "100%" },
  photoBadge: { position: "absolute", top: 8, left: 8, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  photoBadgeBefore: { backgroundColor: "#ef4444" },
  photoBadgeAfter: { backgroundColor: "#059669" },
  photoBadgeText: { color: "#fff", fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  validateBlock: { gap: 12 },
  validateTitle: { fontSize: 20, fontWeight: "900", color: "#0f172a", textAlign: "center" },
  validateSub: { fontSize: 13, color: "#64748b", textAlign: "center" },
  validateBtn: { backgroundColor: "#059669", borderRadius: 18, paddingVertical: 18, alignItems: "center", shadowColor: "#059669", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 8 },
  validateBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  claimOpenBtn: { backgroundColor: "#fef2f2", borderRadius: 16, paddingVertical: 14, alignItems: "center", borderWidth: 1.5, borderColor: "#fecaca" },
  claimOpenBtnText: { color: "#ef4444", fontWeight: "700", fontSize: 14 },
  rateOpenBtn: { backgroundColor: "#1558f5", borderRadius: 18, paddingVertical: 18, alignItems: "center", shadowColor: "#1558f5", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 8 },
  rateOpenBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  doneBlock: { alignItems: "center", gap: 8, paddingVertical: 24 },
  doneEmoji: { fontSize: 56 },
  doneTitle: { fontSize: 22, fontWeight: "900", color: "#059669" },
  doneSub: { fontSize: 14, color: "#64748b" },
  sheetOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end", zIndex: 50 },
  sheet: { backgroundColor: "#fff", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, gap: 12 },
  sheetTitle: { fontSize: 22, fontWeight: "900", color: "#0f172a" },
  sheetSub: { fontSize: 14, color: "#64748b" },
  starsRow: { flexDirection: "row", justifyContent: "center", gap: 6 },
  starBtn: { padding: 6 },
  star: { fontSize: 44, color: "#d1d5db" },
  starActive: { color: "#f59e0b" },
  ratingLabelText: { fontSize: 15, fontWeight: "700", color: "#f59e0b", textAlign: "center" },
  claimInput: { backgroundColor: "#f8fafc", borderRadius: 14, padding: 14, minHeight: 90, borderWidth: 1.5, borderColor: "#e2e8f0" },
  sheetActions: { flexDirection: "row", gap: 12, marginTop: 4 },
  sheetCancelBtn: { flex: 1, backgroundColor: "#f1f5f9", borderRadius: 14, paddingVertical: 15, alignItems: "center" },
  sheetCancelTxt: { color: "#374151", fontWeight: "700", fontSize: 15 },
  sheetOkBtn: { flex: 1, backgroundColor: "#1558f5", borderRadius: 14, paddingVertical: 15, alignItems: "center" },
  sheetOkTxt: { color: "#fff", fontWeight: "800", fontSize: 15 },
  inProgressCard: { backgroundColor: "#fff", borderRadius: 20, padding: 20, shadowColor: "#7c3aed", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 14, elevation: 5, borderWidth: 1.5, borderColor: "#ede9fe", gap: 12 },
  inProgressHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  inProgressTitle: { fontSize: 17, fontWeight: "900", color: "#7c3aed" },
  inProgressSub: { fontSize: 13, color: "#64748b", fontWeight: "500" },
  timerBadge: { backgroundColor: "#f5f3ff", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  timerText: { fontSize: 18, fontWeight: "900", color: "#7c3aed", fontFamily: "monospace" },
  progressSteps: { gap: 10 },
  washStep: { flexDirection: "row", alignItems: "center", gap: 10 },
  washStepDot: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  washDotDone: { backgroundColor: "#059669" },
  washDotActive: { backgroundColor: "#7c3aed" },
  washDotPending: { backgroundColor: "#e2e8f0" },
  washDotInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#fff" },
  washStepLabel: { fontSize: 14, fontWeight: "600", color: "#94a3b8" },
});