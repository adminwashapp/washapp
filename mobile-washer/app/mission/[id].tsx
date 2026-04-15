import { useState, useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, Linking, Image, Platform, TextInput,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { washerApi } from "../../services/api";
import { washerSocket } from "../../services/socket";

// ─────────────────────────────────────────────────────────────────────────────
const SERVICE_LABELS: Record<string, string> = {
  EXTERIOR: "Lavage Extérieur", INTERIOR: "Lavage Intérieur", FULL: "Lavage Complet",
};
const SERVICE_EMOJI: Record<string, string> = {
  EXTERIOR: "🛁", INTERIOR: "✨", FULL: "⭐",
};
const PRICES: Record<string, number> = { EXTERIOR: 1500, INTERIOR: 2500, FULL: 4000 };

// Steps: ACCEPTED → ARRIVED → IN_PROGRESS → DONE
type Step = "ACCEPTED" | "ARRIVED" | "IN_PROGRESS" | "DONE";
const STEPS: { key: Step; label: string }[] = [
  { key: "ACCEPTED",    label: "En route" },
  { key: "ARRIVED",     label: "Arrivé" },
  { key: "IN_PROGRESS", label: "En cours" },
  { key: "DONE",        label: "Terminée" },
];

// ─────────────────────────────────────────────────────────────────────────────
export default function MissionDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [mission,       setMission]       = useState<any>(null);
  const [loading,       setLoading]       = useState(true);
  const [uploading,     setUploading]     = useState<"BEFORE" | "AFTER" | null>(null);
  const [comment,       setComment]       = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  // Local step to track En route → Arrivé even before backend update
  const [localStep, setLocalStep] = useState<Step>("ACCEPTED");

  useEffect(() => {
    washerApi.getReservations()
      .then(r => {
        const m = (r.data || []).find((x: any) => x.id === id);
        if (m) {
          setMission(m);
          if (m.status === "IN_PROGRESS") setLocalStep("IN_PROGRESS");
          else if (m.status === "DONE")   setLocalStep("DONE");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  // ── GPS ──────────────────────────────────────────────────────────────────
  const handleGPS = () => {
    if (!mission) return;
    const dest = mission.lat
      ? `${mission.lat},${mission.lng}`
      : encodeURIComponent(mission.fullAddress || mission.address || "");
    const url = Platform.OS === "ios"
      ? `maps:?daddr=${dest}`
      : `google.navigation:q=${dest}`;
    Linking.openURL(url).catch(() =>
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${dest}`)
    );
  };

  // ── Photos ───────────────────────────────────────────────────────────────
  const pickAndUpload = async (type: "BEFORE" | "AFTER") => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission refusée", "Autorisez l'accès à la caméra.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.75, aspect: [4, 3] });
    if (result.canceled || !result.assets?.[0]) return;

    setUploading(type);
    const asset = result.assets[0];
    const formData = new FormData();
    formData.append("file", { uri: asset.uri, type: "image/jpeg", name: `${type}_${Date.now()}.jpg` } as any);
    try {
      await washerApi.uploadPhoto(id, type, formData);
      setMission((m: any) => ({
        ...m,
        [type === "BEFORE" ? "photoBeforeUrl" : "photoAfterUrl"]: asset.uri,
      }));
    } catch {
      // Still show the photo locally even if upload fails
      setMission((m: any) => ({
        ...m,
        [type === "BEFORE" ? "photoBeforeUrl" : "photoAfterUrl"]: asset.uri,
      }));
    } finally {
      setUploading(null);
    }
  };

  // ── Actions ──────────────────────────────────────────────────────────────
  const handleArrived = () => {
    setLocalStep("IN_PROGRESS");
    // Optionally notify backend
  };

  const handleStart = () => {
    if (!mission) return;
    if (!mission.photoBeforeUrl) {
      Alert.alert("Photo requise", "Prenez la photo AVANT de démarrer la mission.");
      return;
    }
    setActionLoading(true);
    washerSocket.start(mission.id);
    setTimeout(() => {
      setMission((m: any) => ({ ...m, status: "IN_PROGRESS" }));
      setLocalStep("IN_PROGRESS");
      setActionLoading(false);
    }, 500);
  };

  const handleComplete = () => {
    if (!mission?.photoBeforeUrl) {
      Alert.alert("Photo manquante", "La photo AVANT est obligatoire.");
      return;
    }
    if (!mission?.photoAfterUrl) {
      Alert.alert("Photo manquante", "La photo APRÈS est obligatoire.");
      return;
    }
    Alert.alert("Terminer la mission ?", "Confirmez-vous la fin de la prestation ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Oui, terminer",
        onPress: () => {
          washerSocket.complete(mission.id);
          setMission((m: any) => ({ ...m, status: "DONE" }));
          setLocalStep("DONE");
          const isWave = mission?.paymentMethod === "WAVE_MONEY";
          Alert.alert(
            "Mission terminee",
            isWave ? "Bravo ! Attendez que le client envoie le paiement Wave." : "Bravo ! La mission est enregistree.",
            [{ text: "OK", onPress: () => isWave ? router.replace({ pathname: "/wave-confirm/[id]", params: { id: mission.id } }) : router.push("/(tabs)/missions") }]
          );
        },
      },
    ]);
  };

  const handleIncident = () => {
    Alert.alert(
      "Signaler un incident",
      "Décrivez le problème dans le commentaire et envoyez votre signalement.",
      [{ text: "OK" }]
    );
  };

  // ── Loading / not found ───────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#f8fafc" }}>
        <ActivityIndicator size="large" color="#1558f5" />
      </View>
    );
  }
  if (!mission) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#f8fafc", padding: 32 }}>
        <Text style={{ fontSize: 17, color: "#64748b", fontWeight: "600", textAlign: "center" }}>
          Mission introuvable
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20, padding: 16 }}>
          <Text style={{ color: "#1558f5", fontWeight: "700" }}>← Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const price     = mission.price ?? PRICES[mission.serviceType] ?? 0;
  const isDone    = mission.status === "DONE";
  const canStart  = mission.status === "ACCEPTED" && localStep === "IN_PROGRESS";
  const canComplete = mission.status === "IN_PROGRESS";
  const showArrived = mission.status === "ACCEPTED" && localStep === "ACCEPTED";

  // Active step index for progress bar
  const stepIndex = STEPS.findIndex(s => s.key === (isDone ? "DONE" : localStep));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <Text style={styles.backArrow}>{"←"}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mission en cours</Text>
        <View style={[styles.statusPill, { backgroundColor: isDone ? "#ecfdf5" : "#eff6ff" }]}>
          <View style={[styles.statusDot, { backgroundColor: isDone ? "#059669" : "#1558f5" }]} />
          <Text style={[styles.statusPillText, { color: isDone ? "#059669" : "#1558f5" }]}>
            {STEPS[stepIndex]?.label ?? "—"}
          </Text>
        </View>
      </View>

      {/* ── PROGRESS BAR ─────────────────────────────────────────────────── */}
      <View style={styles.progressBar}>
        {STEPS.map((s, i) => (
          <View key={s.key} style={styles.progressStep}>
            <View style={[
              styles.progressDot,
              i <= stepIndex ? styles.progressDotActive : styles.progressDotInactive,
            ]}>
              {i < stepIndex && <Text style={{ color: "#fff", fontSize: 10, fontWeight: "900" }}>✓</Text>}
              {i === stepIndex && <View style={styles.progressDotInner} />}
            </View>
            <Text style={[styles.progressLabel, i <= stepIndex ? styles.progressLabelActive : {}]}>
              {s.label}
            </Text>
            {i < STEPS.length - 1 && (
              <View style={[styles.progressLine, i < stepIndex ? styles.progressLineActive : {}]} />
            )}
          </View>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── BLOC CLIENT & VÉHICULE ────────────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>Client & Véhicule</Text>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeEmoji}>{SERVICE_EMOJI[mission.serviceType]}</Text>
              <Text style={styles.typeBadgeText}>{SERVICE_LABELS[mission.serviceType] ?? "Mission"}</Text>
            </View>
          </View>

          <Text style={styles.priceHero}>{price.toLocaleString("fr-FR")} <Text style={styles.priceUnit}>FCFA</Text></Text>

          <View style={styles.infoGrid}>
            {mission.clientName && <InfoItem icon="👤" label="Client"      value={mission.clientName} />}
            {mission.vehiclePlate && (
              <View style={styles.plateRow}>
                <Text style={styles.infoIcon}>🚗</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>Plaque</Text>
                  <View style={styles.plateBadge}>
                    <Text style={styles.plateBadgeText}>{mission.vehiclePlate}</Text>
                  </View>
                </View>
              </View>
            )}
            {mission.vehicleModel && <InfoItem icon="🚘" label="Véhicule"    value={mission.vehicleModel} />}
            {mission.vehicleColor && <InfoItem icon="🎨" label="Couleur"     value={mission.vehicleColor} />}
            <InfoItem icon="📍" label="Adresse"      value={mission.fullAddress || mission.address || "—"} />
            {mission.clientPhone && <InfoItem icon="📞" label="Téléphone"   value={mission.clientPhone} />}
            {mission.scheduledAt && (
              <InfoItem
                icon="🕐"
                label="Heure prévue"
                value={new Date(mission.scheduledAt).toLocaleString("fr-FR", {
                  weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                })}
              />
            )}
            {mission.instructions && <InfoItem icon="📝" label="Instructions" value={mission.instructions} />}
          </View>
        </View>

        {/* ── BOUTONS ACTIONS RAPIDES ───────────────────────────────────── */}
        {!isDone && (
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.qaBtn} onPress={handleGPS} activeOpacity={0.8}>
              <Text style={styles.qaEmoji}>🗺</Text>
              <Text style={styles.qaBtnText}>Ouvrir GPS</Text>
            </TouchableOpacity>
            {mission.clientPhone && (
              <TouchableOpacity
                style={[styles.qaBtn, styles.qaBtnGreen]}
                onPress={() => Linking.openURL(`tel:${mission.clientPhone}`)}
                activeOpacity={0.8}
              >
                <Text style={styles.qaEmoji}>📞</Text>
                <Text style={[styles.qaBtnText, { color: "#059669" }]}>Appeler</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ── JE SUIS ARRIVÉ ────────────────────────────────────────────── */}
        {showArrived && (
          <TouchableOpacity style={styles.arrivedBtn} onPress={handleArrived} activeOpacity={0.85}>
            <Text style={styles.arrivedEmoji}>📍</Text>
            <Text style={styles.arrivedText}>Je suis arrivé chez le client</Text>
          </TouchableOpacity>
        )}

        {/* ── PHOTOS ───────────────────────────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Photos de la mission</Text>
          <Text style={styles.photosHint}>
            {isDone ? "Photos enregistrées" : "Photo AVANT puis APRÈS — obligatoires pour terminer"}
          </Text>
          <View style={styles.photosRow}>
            <PhotoSlot
              label="AVANT"
              uri={mission.photoBeforeUrl}
              loading={uploading === "BEFORE"}
              onPress={() => pickAndUpload("BEFORE")}
              disabled={isDone}
            />
            <PhotoSlot
              label="APRÈS"
              uri={mission.photoAfterUrl}
              loading={uploading === "AFTER"}
              onPress={() => pickAndUpload("AFTER")}
              disabled={isDone}
            />
          </View>
        </View>

        {/* ── COMMENTAIRE ──────────────────────────────────────────────── */}
        {!isDone && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Commentaire (optionnel)</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Incident, remarque ou information complémentaire..."
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={comment}
              onChangeText={setComment}
            />
            <TouchableOpacity style={styles.incidentBtn} onPress={handleIncident} activeOpacity={0.8}>
              <Text style={styles.incidentEmoji}>⚠️</Text>
              <Text style={styles.incidentText}>Signaler un incident</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── CTA PRINCIPAL ────────────────────────────────────────────── */}
        {canStart && (
          <TouchableOpacity
            style={[styles.ctaBtn, actionLoading && { opacity: 0.6 }]}
            onPress={handleStart}
            disabled={actionLoading}
            activeOpacity={0.85}
          >
            {actionLoading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.ctaBtnText}>🚀 Démarrer la mission</Text>
            }
          </TouchableOpacity>
        )}

        {canComplete && (
          <TouchableOpacity
            style={[styles.ctaBtn, { backgroundColor: "#059669" }]}
            onPress={handleComplete}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaBtnText}>✅ Mission terminée</Text>
          </TouchableOpacity>
        )}

        {isDone && (
          <View style={styles.doneBlock}>
            <Text style={styles.doneEmoji}>🏆</Text>
            <Text style={styles.doneTitle}>Mission terminée !</Text>
            <Text style={styles.doneSubtitle}>{mission?.paymentMethod === "WAVE_MONEY" ? "En attente du paiement Wave du client." : "Le paiement a ete credite a votre wallet."}</Text>
          {mission?.paymentMethod === "WAVE_MONEY" && mission?.status === "DONE" && (
            <TouchableOpacity style={{ backgroundColor: "#00b9f5", borderRadius: 14, paddingVertical: 14, paddingHorizontal: 24, marginTop: 8 }} onPress={() => router.push({ pathname: "/wave-confirm/[id]", params: { id: mission.id } })} activeOpacity={0.85}>
              <Text style={{ color: "#fff", fontWeight: "800", fontSize: 14 }}>{"Confirmer paiement Wave \u2192"}</Text>
            </TouchableOpacity>
          )}
          </View>
        )}

        <View style={{ height: insets.bottom + 32 }} />
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function InfoItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function PhotoSlot({ label, uri, loading, onPress, disabled }: {
  label: string; uri?: string; loading: boolean; onPress: () => void; disabled: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.photoSlot, uri ? styles.photoSlotFilled : {}]}
      onPress={onPress}
      disabled={loading || disabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color="#1558f5" />
      ) : uri ? (
        <Image source={{ uri }} style={StyleSheet.absoluteFillObject as any} resizeMode="cover" />
      ) : (
        <>
          <Text style={styles.photoSlotIcon}>📷</Text>
          <Text style={styles.photoSlotHint}>Prendre photo</Text>
        </>
      )}
      <View style={styles.photoSlotBanner}>
        <Text style={styles.photoSlotBannerText}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },

  // Header
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#f1f5f9",
  },
  backBtn: {
    width: 40, height: 40, backgroundColor: "#f1f5f9", borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  backArrow: { fontSize: 18, fontWeight: "700", color: "#0f172a" },
  headerTitle: { fontSize: 17, fontWeight: "800", color: "#0f172a", flex: 1, textAlign: "center", marginHorizontal: 8 },
  statusPill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusPillText: { fontSize: 11, fontWeight: "800" },

  // Progress bar
  progressBar: {
    flexDirection: "row", backgroundColor: "#fff",
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: "#f1f5f9",
  },
  progressStep: { flex: 1, alignItems: "center", position: "relative" },
  progressDot: {
    width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center",
  },
  progressDotActive:   { backgroundColor: "#1558f5" },
  progressDotInactive: { backgroundColor: "#e2e8f0" },
  progressDotInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#fff" },
  progressLabel: { fontSize: 10, fontWeight: "600", color: "#94a3b8", marginTop: 4, textAlign: "center" },
  progressLabelActive: { color: "#1558f5" },
  progressLine: {
    position: "absolute", top: 11, left: "50%", right: "-50%",
    height: 2, backgroundColor: "#e2e8f0",
  },
  progressLineActive: { backgroundColor: "#1558f5" },

  scroll: { padding: 16, gap: 14 },

  // Card
  card: {
    backgroundColor: "#fff", borderRadius: 20, padding: 20,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
    gap: 12,
  },
  cardTitleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardTitle: { fontSize: 14, fontWeight: "800", color: "#374151", textTransform: "uppercase", letterSpacing: 0.5 },
  typeBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#eff6ff", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14 },
  typeBadgeEmoji: { fontSize: 13 },
  typeBadgeText: { fontSize: 12, fontWeight: "700", color: "#1558f5" },
  priceHero: { fontSize: 34, fontWeight: "900", color: "#0f172a", letterSpacing: -1 },
  priceUnit: { fontSize: 16, fontWeight: "700", color: "#64748b" },

  // Info items
  infoGrid: { gap: 10 },
  infoItem: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  infoIcon: { fontSize: 17, lineHeight: 22, width: 22, textAlign: "center" },
  infoLabel: { fontSize: 10, fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.4 },
  infoValue: { fontSize: 14, fontWeight: "600", color: "#0f172a", marginTop: 2, lineHeight: 20 },

  // Vehicle plate
  plateRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  plateBadge: {
    backgroundColor: "#fef9ec", borderWidth: 2, borderColor: "#f59e0b",
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4, alignSelf: "flex-start", marginTop: 4,
  },
  plateBadgeText: { fontSize: 15, fontWeight: "900", color: "#0f172a", letterSpacing: 2, fontFamily: "monospace" },

  // Quick actions
  quickActions: { flexDirection: "row", gap: 12 },
  qaBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: "#fff", borderRadius: 16, paddingVertical: 15,
    borderWidth: 1.5, borderColor: "#e2e8f0",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  qaBtnGreen: { backgroundColor: "#ecfdf5", borderColor: "#bbf7d0" },
  qaEmoji: { fontSize: 18 },
  qaBtnText: { fontSize: 14, fontWeight: "700", color: "#0f172a" },

  // Je suis arrivé
  arrivedBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: "#fff7ed", borderRadius: 18, paddingVertical: 18,
    borderWidth: 1.5, borderColor: "#fed7aa",
  },
  arrivedEmoji: { fontSize: 22 },
  arrivedText: { fontSize: 15, fontWeight: "800", color: "#c2410c" },

  // Photos
  photosHint: { fontSize: 12, color: "#64748b", fontWeight: "500" },
  photosRow: { flexDirection: "row", gap: 12 },
  photoSlot: {
    flex: 1, height: 150, backgroundColor: "#f8fafc", borderRadius: 16,
    borderWidth: 2, borderColor: "#e2e8f0", borderStyle: "dashed",
    alignItems: "center", justifyContent: "center", overflow: "hidden", gap: 8,
  },
  photoSlotFilled: { borderStyle: "solid", borderColor: "transparent" },
  photoSlotIcon: { fontSize: 30 },
  photoSlotHint: { fontSize: 11, fontWeight: "600", color: "#94a3b8" },
  photoSlotBanner: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: "rgba(0,0,0,0.5)", paddingVertical: 5, alignItems: "center",
  },
  photoSlotBannerText: { color: "#fff", fontSize: 11, fontWeight: "800", letterSpacing: 1 },

  // Comment
  commentInput: {
    backgroundColor: "#f8fafc", borderRadius: 14, padding: 14, minHeight: 90,
    borderWidth: 1.5, borderColor: "#e2e8f0",
    fontSize: 14, color: "#0f172a", fontWeight: "500",
  },
  incidentBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#fef2f2", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1.5, borderColor: "#fecaca", alignSelf: "flex-start",
  },
  incidentEmoji: { fontSize: 16 },
  incidentText: { fontSize: 13, fontWeight: "700", color: "#ef4444" },

  // CTA
  ctaBtn: {
    backgroundColor: "#1558f5", borderRadius: 18, paddingVertical: 19, alignItems: "center",
    shadowColor: "#1558f5", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 8,
  },
  ctaBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },

  // Done state
  doneBlock: {
    alignItems: "center", backgroundColor: "#fff", borderRadius: 20, padding: 32,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
    gap: 8,
  },
  doneEmoji: { fontSize: 48 },
  doneTitle: { fontSize: 22, fontWeight: "900", color: "#059669" },
  doneSubtitle: { fontSize: 14, color: "#64748b", textAlign: "center", fontWeight: "500" },
});