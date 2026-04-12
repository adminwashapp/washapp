import { useState, useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, Animated, Easing, Linking, Image, Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { missionsApi } from "../../services/api";

// ─────────────────────────────────────────────────────────────────────────────
const SERVICE_LABELS: Record<string, string> = {
  EXTERIOR: "Lavage Extérieur", INTERIOR: "Lavage Intérieur", FULL: "Lavage Complet",
};
const SERVICE_EMOJI: Record<string, string> = {
  EXTERIOR: "🚿", INTERIOR: "✨", FULL: "⭐",
};

type Status = "SEARCHING"|"ASSIGNED"|"EN_ROUTE"|"ARRIVED"|"IN_PROGRESS"|"COMPLETED"|"VALIDATED"|"CANCELLED";

const STEPS: { key: Status[]; label: string; icon: string }[] = [
  { key: ["SEARCHING"],            label: "Recherche",  icon: "🔍" },
  { key: ["ASSIGNED","EN_ROUTE"],  label: "En route",   icon: "🛵" },
  { key: ["ARRIVED"],              label: "Arrivé",     icon: "📍" },
  { key: ["IN_PROGRESS"],          label: "En cours",   icon: "✨" },
  { key: ["COMPLETED","VALIDATED"],label: "Terminé",    icon: "✅" },
];

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  SEARCHING:  { label: "Recherche d'un washer...",  color: "#d97706", bg: "#fffbeb" },
  ASSIGNED:   { label: "Washer trouvé !",           color: "#1558f5", bg: "#eff6ff" },
  EN_ROUTE:   { label: "Washer en route vers vous", color: "#1558f5", bg: "#eff6ff" },
  ARRIVED:    { label: "Washer arrivé chez vous",   color: "#7c3aed", bg: "#f5f3ff" },
  IN_PROGRESS:{ label: "Lavage en cours...",        color: "#7c3aed", bg: "#f5f3ff" },
  COMPLETED:  { label: "Terminé — à valider",       color: "#059669", bg: "#ecfdf5" },
  VALIDATED:  { label: "Mission validée",           color: "#059669", bg: "#ecfdf5" },
  CANCELLED:  { label: "Annulée",                   color: "#ef4444", bg: "#fef2f2" },
};

// ─────────────────────────────────────────────────────────────────────────────
export default function TrackingScreen() {
  const router    = useRouter();
  const insets    = useSafeAreaInsets();
  const { id }    = useLocalSearchParams<{ id: string }>();

  const [mission,     setMission]     = useState<any>(null);
  const [loading,     setLoading]     = useState(true);
  const [submitting,  setSubmitting]  = useState(false);
  const [showRating,  setShowRating]  = useState(false);
  const [showClaim,   setShowClaim]   = useState(false);
  const [rating,      setRating]      = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [claimText,   setClaimText]   = useState("");

  const dotAnim = useRef(new Animated.Value(0)).current;

  // Blinking dot for "active" statuses
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

  const fetchMission = async () => {
    if (!id) return;
    try {
      const res = await missionsApi.getById(id);
      setMission(res.data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchMission();
    const poll = setInterval(fetchMission, 8000);
    return () => clearInterval(poll);
  }, [id]);

  // ── Validate ─────────────────────────────────────────────────────────────
  const handleValidate = async () => {
    setSubmitting(true);
    try {
      await missionsApi.validate(id);
      await fetchMission();
      setShowRating(true);
    } catch (e: any) {
      Alert.alert("Erreur", e.response?.data?.message || "Impossible de valider");
    } finally { setSubmitting(false); }
  };

  // ── Rate ──────────────────────────────────────────────────────────────────
  const handleRate = async () => {
    if (!rating) return;
    setSubmitting(true);
    try {
      await missionsApi.rate(id, { stars: rating, comment: ratingComment });
      setShowRating(false);
      await fetchMission();
    } finally { setSubmitting(false); }
  };

  // ── Complaint ─────────────────────────────────────────────────────────────
  const handleComplaint = async () => {
    if (!claimText.trim()) return;
    setSubmitting(true);
    try {
      await missionsApi.complain(id, { reason: claimText });
      setShowClaim(false);
      await fetchMission();
    } finally { setSubmitting(false); }
  };

  // ── GPS ───────────────────────────────────────────────────────────────────
  const openGPS = () => {
    if (!mission) return;
    const dest = mission.lat
      ? `${mission.lat},${mission.lng}`
      : encodeURIComponent(mission.fullAddress || "");
    const url = Platform.OS === "ios" ? `maps:?daddr=${dest}` : `google.navigation:q=${dest}`;
    Linking.openURL(url).catch(() =>
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${dest}`)
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#f8fafc", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#1558f5" />
      </View>
    );
  }
  if (!mission) {
    return (
      <View style={{ flex: 1, backgroundColor: "#f8fafc", alignItems: "center", justifyContent: "center", padding: 32 }}>
        <Text style={{ color: "#64748b", fontSize: 16, fontWeight: "600" }}>Mission introuvable</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20, padding: 16 }}>
          <Text style={{ color: "#1558f5", fontWeight: "700" }}>← Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const status: Status = mission.status ?? "SEARCHING";
  const meta   = STATUS_META[status] ?? STATUS_META.SEARCHING;
  const activeStepIdx = STEPS.findIndex(s => s.key.includes(status));
  const isDone  = status === "VALIDATED" || status === "COMPLETED";
  const washer  = mission.washer;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <Text style={styles.backArrow}>{"←"}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Suivi de mission</Text>
        <View style={[styles.statusPill, { backgroundColor: meta.bg }]}>
          <Animated.View style={[styles.statusDot, { backgroundColor: meta.color, opacity: dotAnim }]} />
          <Text style={[styles.statusPillText, { color: meta.color }]}>{meta.label}</Text>
        </View>
      </View>

      {/* ── PROGRESS BAR ────────────────────────────────────────────────── */}
      <View style={styles.progressBar}>
        {STEPS.map((step, i) => {
          const done   = i < activeStepIdx;
          const active = i === activeStepIdx;
          return (
            <View key={step.label} style={styles.progressItem}>
              <View style={[styles.progressDot, done || active ? styles.dotActive : styles.dotInactive]}>
                {done   ? <Text style={{ color: "#fff", fontSize: 9, fontWeight: "900" }}>✓</Text>  : null}
                {active ? <View style={styles.dotInner} /> : null}
                {!done && !active ? <Text style={{ fontSize: 9, color: "#94a3b8" }}>{step.icon}</Text> : null}
              </View>
              <Text style={[styles.progressLabel, (done || active) ? styles.labelActive : {}]} numberOfLines={1}>
                {step.label}
              </Text>
              {i < STEPS.length - 1 && (
                <View style={[styles.progressLine, done ? styles.lineActive : {}]} />
              )}
            </View>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── MAP PLACEHOLDER ─────────────────────────────────────────── */}
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapEmoji}>📍</Text>
          <Text style={styles.mapAddress} numberOfLines={2}>{mission.fullAddress || mission.address || "Localisation en cours..."}</Text>
          <TouchableOpacity style={styles.mapGpsBtn} onPress={openGPS} activeOpacity={0.8}>
            <Text style={styles.mapGpsBtnText}>🗺 Voir l{"'"}itinéraire</Text>
          </TouchableOpacity>
        </View>

        {/* ── WASHER CARD ─────────────────────────────────────────────── */}
        {washer && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Votre washer</Text>
            <View style={styles.washerRow}>
              <View style={styles.washerAvatar}>
                {washer.photoUrl
                  ? <Image source={{ uri: washer.photoUrl }} style={StyleSheet.absoluteFillObject as any} borderRadius={32} />
                  : <Text style={styles.washerAvatarEmoji}>🧑🔧</Text>
                }
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.washerName}>{washer.user?.name ?? washer.name ?? "Washer"}</Text>
                {washer.averageRating && (
                  <View style={styles.ratingRow}>
                    <Text style={styles.starEmoji}>⭐</Text>
                    <Text style={styles.ratingVal}>{Number(washer.averageRating).toFixed(1)}</Text>
                  </View>
                )}
              </View>
              {(washer.user?.phone ?? washer.phone) && (
                <TouchableOpacity
                  style={styles.callBtn}
                  onPress={() => Linking.openURL(`tel:${washer.user?.phone ?? washer.phone}`)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.callEmoji}>📞</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* ── MISSION DETAILS ─────────────────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Détails de la prestation</Text>
          <View style={styles.detailsGrid}>
            <DetailRow icon={SERVICE_EMOJI[mission.serviceType] ?? "🚗"} label="Prestation"
              value={SERVICE_LABELS[mission.serviceType] ?? "—"} />
            <DetailRow icon="💰" label="Montant"
              value={`${(mission.price ?? 0).toLocaleString("fr-FR")} FCFA`} highlight />
            <DetailRow icon="📍" label="Adresse" value={mission.fullAddress || "—"} />
            {mission.scheduledAt && (
              <DetailRow icon="🕐" label="Heure prévue"
                value={new Date(mission.scheduledAt).toLocaleString("fr-FR", {
                  weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                })}
              />
            )}
            {mission.vehiclePlate && (
              <DetailRow icon="🚗" label="Plaque" value={mission.vehiclePlate} />
            )}
            {mission.instructions && (
              <DetailRow icon="📝" label="Instructions" value={mission.instructions} />
            )}
          </View>
        </View>

        {/* ── PHOTOS ──────────────────────────────────────────────────── */}
        {mission.photos?.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Photos du lavage</Text>
            <View style={styles.photosRow}>
              {mission.photos.map((p: any) => (
                <View key={p.id ?? p.url} style={styles.photoWrap}>
                  <Image source={{ uri: p.url }} style={styles.photo} resizeMode="cover" />
                  <View style={[styles.photoBadge, p.type === "BEFORE" ? styles.photoBadgeBefore : styles.photoBadgeAfter]}>
                    <Text style={styles.photoBadgeText}>{p.type === "BEFORE" ? "AVANT" : "APRÈS"}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── CTA VALIDATE ────────────────────────────────────────────── */}
        {status === "COMPLETED" && (
          <View style={styles.validateBlock}>
            <Text style={styles.validateTitle}>Mission terminée !</Text>
            <Text style={styles.validateSub}>Vérifiez les photos et validez si tout est bon.</Text>
            <TouchableOpacity
              style={styles.validateBtn}
              onPress={handleValidate}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.validateBtnText}>✅ Valider la mission</Text>
              }
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.claimOpenBtn}
              onPress={() => setShowClaim(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.claimOpenBtnText}>⚠️ Signaler un problème</Text>
            </TouchableOpacity>
          </View>
        )}

        {status === "VALIDATED" && !mission.rating && (
          <TouchableOpacity style={styles.rateOpenBtn} onPress={() => setShowRating(true)} activeOpacity={0.85}>
            <Text style={styles.rateOpenBtnText}>⭐ Noter mon washer</Text>
          </TouchableOpacity>
        )}

        {status === "VALIDATED" && mission.rating && (
          <View style={styles.doneBlock}>
            <Text style={styles.doneEmoji}>🏆</Text>
            <Text style={styles.doneTitle}>Merci pour votre confiance !</Text>
            <Text style={styles.doneSub}>À très bientôt sur Washapp.</Text>
          </View>
        )}

        <View style={{ height: insets.bottom + 32 }} />
      </ScrollView>

      {/* ── RATING SHEET ─────────────────────────────────────────────────── */}
      {showRating && (
        <View style={styles.sheetOverlay}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Notez votre washer</Text>
            <Text style={styles.sheetSub}>Comment s{"'"}est passée la mission ?</Text>
            <View style={styles.starsRow}>
              {[1,2,3,4,5].map(s => (
                <TouchableOpacity key={s} onPress={() => setRating(s)} style={styles.starBtn} activeOpacity={0.7}>
                  <Text style={[styles.star, s <= rating ? styles.starActive : {}]}>
                    {s <= rating ? "★" : "☆"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {rating > 0 && (
              <Text style={styles.ratingLabelText}>
                {rating === 5 ? "Excellent !" : rating === 4 ? "Très bien" : rating === 3 ? "Bien" : rating === 2 ? "Peut mieux faire" : "Décevant"}
              </Text>
            )}
            {rating > 0 && rating < 5 && (
              <TouchableOpacity style={styles.claimSuggBtn} onPress={() => { setShowRating(false); setShowClaim(true); }} activeOpacity={0.8}>
                <Text style={styles.claimSuggTxt}>Signaler un problème ?</Text>
              </TouchableOpacity>
            )}
            <View style={styles.sheetActions}>
              <TouchableOpacity style={styles.sheetCancelBtn} onPress={() => setShowRating(false)} activeOpacity={0.8}>
                <Text style={styles.sheetCancelTxt}>Plus tard</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sheetOkBtn, (!rating || submitting) && { opacity: 0.5 }]}
                onPress={handleRate}
                disabled={!rating || submitting}
                activeOpacity={0.85}
              >
                {submitting ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.sheetOkTxt}>Envoyer</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* ── COMPLAINT SHEET ──────────────────────────────────────────────── */}
      {showClaim && (
        <View style={styles.sheetOverlay}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Signaler un problème</Text>
            <Text style={styles.sheetSub}>Décrivez le problème rencontré.</Text>
            <View style={styles.claimInput}>
              <Text style={{ color: "#94a3b8", fontSize: 14 }} onPress={() => {}}>
                {claimText || "Décrivez le problème..."}
              </Text>
            </View>
            <View style={styles.sheetActions}>
              <TouchableOpacity style={styles.sheetCancelBtn} onPress={() => setShowClaim(false)} activeOpacity={0.8}>
                <Text style={styles.sheetCancelTxt}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sheetOkBtn, { backgroundColor: "#ef4444" }, (!claimText.trim() || submitting) && { opacity: 0.5 }]}
                onPress={handleComplaint}
                disabled={!claimText.trim() || submitting}
                activeOpacity={0.85}
              >
                {submitting ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.sheetOkTxt}>Signaler</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },

  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#f1f5f9",
  },
  backBtn: { width: 40, height: 40, backgroundColor: "#f1f5f9", borderRadius: 12, alignItems: "center", justifyContent: "center" },
  backArrow: { fontSize: 18, fontWeight: "700", color: "#0f172a" },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: "800", color: "#0f172a", textAlign: "center", marginHorizontal: 8 },
  statusPill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusPillText: { fontSize: 10, fontWeight: "800" },

  progressBar: {
    flexDirection: "row", backgroundColor: "#fff",
    paddingHorizontal: 12, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: "#f1f5f9",
  },
  progressItem: { flex: 1, alignItems: "center", position: "relative" },
  progressDot: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  dotActive:   { backgroundColor: "#1558f5" },
  dotInactive: { backgroundColor: "#e2e8f0" },
  dotInner:    { width: 8, height: 8, borderRadius: 4, backgroundColor: "#fff" },
  progressLabel: { fontSize: 9, fontWeight: "600", color: "#94a3b8", marginTop: 3, textAlign: "center" },
  labelActive:   { color: "#1558f5" },
  progressLine:  { position: "absolute", top: 11, left: "50%", right: "-50%", height: 2, backgroundColor: "#e2e8f0" },
  lineActive:    { backgroundColor: "#1558f5" },

  scroll: { padding: 16, gap: 14 },

  mapPlaceholder: {
    backgroundColor: "#1e293b", borderRadius: 20, height: 140,
    alignItems: "center", justifyContent: "center", gap: 8,
  },
  mapEmoji: { fontSize: 28 },
  mapAddress: { fontSize: 13, color: "#94a3b8", textAlign: "center", paddingHorizontal: 20, fontWeight: "500" },
  mapGpsBtn: {
    backgroundColor: "#1558f5", paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 12, marginTop: 4,
  },
  mapGpsBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },

  card: {
    backgroundColor: "#fff", borderRadius: 20, padding: 20,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
    gap: 14,
  },
  cardTitle: { fontSize: 13, fontWeight: "800", color: "#374151", textTransform: "uppercase", letterSpacing: 0.5 },

  washerRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  washerAvatar: {
    width: 58, height: 58, borderRadius: 29, backgroundColor: "#eff6ff",
    alignItems: "center", justifyContent: "center", overflow: "hidden",
  },
  washerAvatarEmoji: { fontSize: 26 },
  washerName: { fontSize: 17, fontWeight: "800", color: "#0f172a" },
  ratingRow:  { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  starEmoji:  { fontSize: 13 },
  ratingVal:  { fontSize: 13, fontWeight: "700", color: "#f59e0b" },
  callBtn:    { width: 46, height: 46, borderRadius: 23, backgroundColor: "#ecfdf5", alignItems: "center", justifyContent: "center" },
  callEmoji:  { fontSize: 22 },

  detailsGrid: { gap: 10 },
  detailRow:   { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  detailIcon:  { fontSize: 16, lineHeight: 22, width: 22, textAlign: "center" },
  detailLabel: { fontSize: 10, fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.3 },
  detailValue: { fontSize: 14, fontWeight: "600", color: "#0f172a", marginTop: 2, lineHeight: 20 },

  photosRow:   { flexDirection: "row", gap: 12 },
  photoWrap:   { flex: 1, height: 150, borderRadius: 14, overflow: "hidden" },
  photo:       { width: "100%", height: "100%" },
  photoBadge:  { position: "absolute", top: 8, left: 8, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  photoBadgeBefore: { backgroundColor: "#ef4444" },
  photoBadgeAfter:  { backgroundColor: "#059669" },
  photoBadgeText:   { color: "#fff", fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },

  validateBlock: { gap: 12 },
  validateTitle: { fontSize: 20, fontWeight: "900", color: "#0f172a", textAlign: "center" },
  validateSub:   { fontSize: 13, color: "#64748b", textAlign: "center" },
  validateBtn: {
    backgroundColor: "#059669", borderRadius: 18, paddingVertical: 18, alignItems: "center",
    shadowColor: "#059669", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 8,
  },
  validateBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  claimOpenBtn: {
    backgroundColor: "#fef2f2", borderRadius: 16, paddingVertical: 14, alignItems: "center",
    borderWidth: 1.5, borderColor: "#fecaca",
  },
  claimOpenBtnText: { color: "#ef4444", fontWeight: "700", fontSize: 14 },

  rateOpenBtn: {
    backgroundColor: "#1558f5", borderRadius: 18, paddingVertical: 18, alignItems: "center",
    shadowColor: "#1558f5", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 8,
  },
  rateOpenBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },

  doneBlock:  { alignItems: "center", gap: 8, paddingVertical: 24 },
  doneEmoji:  { fontSize: 56 },
  doneTitle:  { fontSize: 22, fontWeight: "900", color: "#059669" },
  doneSub:    { fontSize: 14, color: "#64748b" },

  sheetOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end", zIndex: 50,
  },
  sheet: {
    backgroundColor: "#fff", borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 28, gap: 12,
  },
  sheetTitle: { fontSize: 22, fontWeight: "900", color: "#0f172a" },
  sheetSub:   { fontSize: 14, color: "#64748b" },
  starsRow:   { flexDirection: "row", justifyContent: "center", gap: 6 },
  starBtn:    { padding: 6 },
  star:       { fontSize: 44, color: "#d1d5db" },
  starActive: { color: "#f59e0b" },
  ratingLabelText: { fontSize: 15, fontWeight: "700", color: "#f59e0b", textAlign: "center" },
  claimSuggBtn: {
    backgroundColor: "#fef2f2", borderRadius: 12, paddingVertical: 12, alignItems: "center",
    borderWidth: 1.5, borderColor: "#fecaca",
  },
  claimSuggTxt: { color: "#ef4444", fontWeight: "700", fontSize: 14 },
  claimInput: {
    backgroundColor: "#f8fafc", borderRadius: 14, padding: 14, minHeight: 90,
    borderWidth: 1.5, borderColor: "#e2e8f0",
  },
  sheetActions:    { flexDirection: "row", gap: 12, marginTop: 4 },
  sheetCancelBtn:  { flex: 1, backgroundColor: "#f1f5f9", borderRadius: 14, paddingVertical: 15, alignItems: "center" },
  sheetCancelTxt:  { color: "#374151", fontWeight: "700", fontSize: 15 },
  sheetOkBtn:      { flex: 1, backgroundColor: "#1558f5", borderRadius: 14, paddingVertical: 15, alignItems: "center" },
  sheetOkTxt:      { color: "#fff", fontWeight: "800", fontSize: 15 },
});