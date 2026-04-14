import { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
  ScrollView, Alert, Linking, Share,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { missionsApi, paymentsApi } from "../../services/api";

const SERVICE_LABELS: Record<string, string> = {
  EXTERIOR: "Lavage Exterieur",
  INTERIOR: "Lavage Interieur",
  FULL:     "Lavage Complet",
};

const PRICE_MAP: Record<string, number> = {
  EXTERIOR: 1500,
  INTERIOR: 2500,
  FULL:     4000,
};

export default function WavePaymentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [mission, setMission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    missionsApi.getMission(id).then(r => {
      setMission(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const washerWaveNumber =
    mission?.washer?.waveMoneyNumber ||
    mission?.washer?.orangeMoneyNumber ||
    "---";

  const amount = mission?.price ?? PRICE_MAP[mission?.serviceType] ?? 0;
  const serviceLabel = SERVICE_LABELS[mission?.serviceType] ?? "Lavage";

  const openWaveApp = () => {
    Linking.openURL("market://details?id=com.wave.clientapp").catch(() =>
      Linking.openURL("https://wave.com/fr-CI/")
    );
  };

  const shareNumber = () => {
    Share.share({ message: `Numero Wave Washapp : ${washerWaveNumber}` });
  };

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await paymentsApi.confirmCashClient(id);
      setPaid(true);
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      if (typeof msg === "string" && msg.includes("deja")) {
        setPaid(true);
      } else {
        Alert.alert("Erreur", "Impossible de confirmer le paiement. Reessayez.");
      }
    } finally {
      setConfirming(false);
    }
  };

  const goToReview = () => {
    router.replace({ pathname: "/mission-review/[id]", params: { id } });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1558f5" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.badge}>Paiement Wave Money</Text>
          <Text style={styles.title}>Payez votre washer</Text>
          <Text style={styles.subtitle}>
            Envoyez le montant ci-dessous via Wave a votre washer
          </Text>
        </View>

        {/* Montant */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Montant a payer</Text>
          <Text style={styles.amountValue}>{amount.toLocaleString()} FCFA</Text>
          <Text style={styles.amountService}>{serviceLabel}</Text>
        </View>

        {/* Numero Wave du washer */}
        <View style={styles.waveCard}>
          <View style={styles.waveHeader}>
            <Text style={styles.waveTitle}>Numero Wave du washer</Text>
            <TouchableOpacity onPress={shareNumber} style={styles.shareBtn} activeOpacity={0.7}>
              <Text style={styles.shareBtnText}>Partager</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.waveNumber}>{washerWaveNumber}</Text>
          <Text style={styles.washerName}>
            {mission?.washer?.user?.name || "Votre washer"}
          </Text>
        </View>

        {/* Etapes */}
        <View style={styles.stepsCard}>
          <Text style={styles.stepsTitle}>Comment payer ?</Text>
          {[
            "Ouvrez l'application Wave sur votre telephone",
            `Envoyez ${amount.toLocaleString()} FCFA au numero ${washerWaveNumber}`,
            'Dans la note, ecrivez "Washapp"',
            "Revenez ici et confirmez le paiement",
          ].map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{i + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        {/* Bouton ouvrir Wave */}
        <TouchableOpacity style={styles.openWaveBtn} onPress={openWaveApp} activeOpacity={0.85}>
          <Text style={styles.openWaveBtnText}>Ouvrir l'app Wave</Text>
        </TouchableOpacity>

        {/* Confirmation */}
        {!paid ? (
          <TouchableOpacity
            style={[styles.confirmBtn, confirming && { opacity: 0.6 }]}
            onPress={handleConfirm}
            disabled={confirming}
            activeOpacity={0.85}
          >
            {confirming
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.confirmBtnText}>J'ai envoye le paiement</Text>
            }
          </TouchableOpacity>
        ) : (
          <View style={styles.paidBlock}>
            <Text style={styles.paidCheck}>{"\u2705"}</Text>
            <Text style={styles.paidTitle}>Paiement confirme !</Text>
            <Text style={styles.paidSub}>Merci. Votre washer va recevoir la confirmation.</Text>
            <TouchableOpacity style={styles.reviewBtn} onPress={goToReview} activeOpacity={0.85}>
              <Text style={styles.reviewBtnText}>Noter la prestation</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: "#f8fafc" },
  scroll:     { padding: 24, paddingBottom: 40 },
  center:     { flex: 1, alignItems: "center", justifyContent: "center" },

  header:     { alignItems: "center", marginBottom: 24 },
  badge:      { backgroundColor: "#eff6ff", color: "#1558f5", fontWeight: "700", fontSize: 12, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, marginBottom: 12, overflow: "hidden" },
  title:      { fontSize: 26, fontWeight: "900", color: "#0f172a", textAlign: "center", marginBottom: 6 },
  subtitle:   { fontSize: 14, color: "#64748b", textAlign: "center", lineHeight: 20 },

  amountCard: { backgroundColor: "#1558f5", borderRadius: 20, padding: 24, alignItems: "center", marginBottom: 16, shadowColor: "#1558f5", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 10 },
  amountLabel:{ fontSize: 13, color: "rgba(255,255,255,0.75)", fontWeight: "600", marginBottom: 6 },
  amountValue:{ fontSize: 42, fontWeight: "900", color: "#fff", letterSpacing: -1 },
  amountService:{ fontSize: 14, color: "rgba(255,255,255,0.75)", marginTop: 4 },

  waveCard:   { backgroundColor: "#fff", borderRadius: 20, padding: 20, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 3 },
  waveHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  waveTitle:  { fontSize: 13, fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 },
  shareBtn:   { backgroundColor: "#eff6ff", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  shareBtnText:{ fontSize: 12, fontWeight: "700", color: "#1558f5" },
  waveNumber: { fontSize: 32, fontWeight: "900", color: "#0f172a", letterSpacing: 2, marginBottom: 4 },
  washerName: { fontSize: 14, color: "#64748b", fontWeight: "500" },

  stepsCard:  { backgroundColor: "#fff", borderRadius: 20, padding: 20, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 3, gap: 14 },
  stepsTitle: { fontSize: 15, fontWeight: "800", color: "#0f172a", marginBottom: 4 },
  stepRow:    { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  stepNum:    { width: 26, height: 26, borderRadius: 13, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center", marginTop: 1 },
  stepNumText:{ fontSize: 13, fontWeight: "800", color: "#1558f5" },
  stepText:   { flex: 1, fontSize: 14, color: "#374151", lineHeight: 20 },

  openWaveBtn:{ backgroundColor: "#00b9f5", borderRadius: 16, paddingVertical: 16, alignItems: "center", marginBottom: 12 },
  openWaveBtnText:{ color: "#fff", fontWeight: "800", fontSize: 15 },

  confirmBtn: { backgroundColor: "#059669", borderRadius: 18, paddingVertical: 18, alignItems: "center", marginBottom: 12, shadowColor: "#059669", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 8 },
  confirmBtnText:{ color: "#fff", fontWeight: "800", fontSize: 16 },

  paidBlock:  { alignItems: "center", gap: 10, paddingVertical: 20 },
  paidCheck:  { fontSize: 56 },
  paidTitle:  { fontSize: 22, fontWeight: "900", color: "#059669" },
  paidSub:    { fontSize: 14, color: "#64748b", textAlign: "center" },
  reviewBtn:  { backgroundColor: "#1558f5", borderRadius: 16, paddingVertical: 16, paddingHorizontal: 32, marginTop: 8 },
  reviewBtnText:{ color: "#fff", fontWeight: "800", fontSize: 15 },
});