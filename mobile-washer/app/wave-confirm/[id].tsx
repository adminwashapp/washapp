import { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
  ScrollView, Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { washerApi } from "../../services/api";

const PRICE_MAP: Record<string, number> = {
  EXTERIOR: 1500, INTERIOR: 2500, FULL: 4000,
};
const SERVICE_LABELS: Record<string, string> = {
  EXTERIOR: "Lavage Exterieur", INTERIOR: "Lavage Interieur", FULL: "Lavage Complet",
};

export default function WaveConfirmScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [mission, setMission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [polling, setPolling] = useState(true);

  const fetchMission = async () => {
    try {
      const r = await washerApi.getReservations();
      const m = (r.data || []).find((x: any) => x.id === id);
      if (m) {
        setMission(m);
        if (m.paymentStatus === "PAID" || m.status === "VALIDATED") {
          setConfirmed(true);
          setPolling(false);
        }
      }
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchMission();
    const t = setInterval(() => { if (polling) fetchMission(); }, 5000);
    return () => clearInterval(t);
  }, [polling]);

  const handleConfirmReceived = async () => {
    setConfirming(true);
    try {
      await washerApi.confirmWavePayment(id);
      setConfirmed(true);
      setPolling(false);
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      if (msg && typeof msg === "string" && msg.includes("deja")) {
        setConfirmed(true);
      } else {
        Alert.alert("Erreur", "Impossible de confirmer. Reessayez.");
      }
    } finally { setConfirming(false); }
  };

  if (loading) return (
    <View style={styles.center}><ActivityIndicator size="large" color="#00b9f5" /></View>
  );

  const amount = mission?.price ?? PRICE_MAP[mission?.serviceType] ?? 0;
  const clientName = mission?.client?.user?.name || mission?.clientName || "Client";
  const myWaveNumber = mission?.washer?.waveMoneyNumber || "---";

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <Text style={styles.backArrow}>{"\u2190"}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paiement Wave</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]} showsVerticalScrollIndicator={false}>

        {!confirmed ? (
          <>
            {/* Attente paiement */}
            <View style={styles.waitCard}>
              <Text style={styles.waitEmoji}>{"\u23F3"}</Text>
              <Text style={styles.waitTitle}>En attente du paiement</Text>
              <Text style={styles.waitSub}>Le client va vous envoyer le paiement via Wave Money. Verifiez votre application Wave.</Text>
              <View style={styles.waitDots}>
                <ActivityIndicator size="small" color="#00b9f5" />
                <Text style={styles.waitDotsText}>Surveillance automatique...</Text>
              </View>
            </View>

            {/* Mon numero Wave */}
            <View style={styles.myNumberCard}>
              <Text style={styles.myNumberTitle}>Votre numero Wave</Text>
              <Text style={styles.myNumberSub}>Le client va envoyer a ce numero</Text>
              <View style={styles.myNumberBox}>
                <Text style={styles.myNumber}>{myWaveNumber}</Text>
              </View>
            </View>

            {/* Detail mission */}
            <View style={styles.missionCard}>
              <Text style={styles.missionCardTitle}>Detail de la mission</Text>
              <View style={styles.missionRow}>
                <Text style={styles.missionKey}>Client</Text>
                <Text style={styles.missionVal}>{clientName}</Text>
              </View>
              <View style={styles.missionRow}>
                <Text style={styles.missionKey}>Prestation</Text>
                <Text style={styles.missionVal}>{SERVICE_LABELS[mission?.serviceType] ?? "Lavage"}</Text>
              </View>
              <View style={[styles.missionRow, styles.missionRowHighlight]}>
                <Text style={styles.missionKey}>Montant a recevoir</Text>
                <Text style={[styles.missionVal, { color: "#00b9f5", fontWeight: "900", fontSize: 20 }]}>{amount.toLocaleString()} FCFA</Text>
              </View>
            </View>

            {/* Confirmation manuelle */}
            <View style={styles.manualCard}>
              <Text style={styles.manualTitle}>Vous avez recu le paiement ?</Text>
              <Text style={styles.manualSub}>Si vous avez bien recu {amount.toLocaleString()} FCFA sur Wave, confirmez ici.</Text>
              <TouchableOpacity
                style={[styles.confirmBtn, confirming && { opacity: 0.6 }]}
                onPress={handleConfirmReceived}
                disabled={confirming}
                activeOpacity={0.85}
              >
                {confirming
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.confirmBtnText}>{"\u2705"}  Oui, j{"'"}ai recu le paiement</Text>
                }
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.doneCard}>
            <Text style={styles.doneEmoji}>{"\uD83C\uDF89"}</Text>
            <Text style={styles.doneTitle}>Paiement recu !</Text>
            <Text style={styles.doneSub}>
              {amount.toLocaleString()} FCFA bien credites. Bravo pour cette mission !
            </Text>
            <View style={styles.amountBig}>
              <Text style={styles.amountBigVal}>+{amount.toLocaleString()}</Text>
              <Text style={styles.amountBigUnit}>FCFA</Text>
            </View>
            <TouchableOpacity
              style={styles.homeBtn}
              onPress={() => router.replace("/(tabs)/missions")}
              activeOpacity={0.85}
            >
              <Text style={styles.homeBtnText}>Retour aux missions</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.walletBtn}
              onPress={() => router.replace("/(tabs)/wallet")}
              activeOpacity={0.8}
            >
              <Text style={styles.walletBtnText}>{"\uD83D\uDCB0"} Voir mon wallet</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f9ff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#f0f9ff" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#e0f2fe" },
  backBtn: { width: 40, height: 40, backgroundColor: "#f0f9ff", borderRadius: 12, alignItems: "center", justifyContent: "center" },
  backArrow: { fontSize: 18, fontWeight: "700", color: "#0f172a" },
  headerTitle: { fontSize: 17, fontWeight: "800", color: "#0f172a" },
  scroll: { padding: 20, gap: 16 },
  waitCard: { backgroundColor: "#fff", borderRadius: 22, padding: 28, alignItems: "center", gap: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 3 },
  waitEmoji: { fontSize: 52 },
  waitTitle: { fontSize: 20, fontWeight: "900", color: "#0f172a" },
  waitSub: { fontSize: 14, color: "#64748b", textAlign: "center", lineHeight: 20 },
  waitDots: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  waitDotsText: { fontSize: 13, color: "#00b9f5", fontWeight: "600" },
  myNumberCard: { backgroundColor: "#00b9f5", borderRadius: 20, padding: 24, alignItems: "center", gap: 8, shadowColor: "#00b9f5", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10 },
  myNumberTitle: { fontSize: 13, fontWeight: "700", color: "rgba(255,255,255,0.85)", textTransform: "uppercase", letterSpacing: 0.5 },
  myNumberSub: { fontSize: 12, color: "rgba(255,255,255,0.7)" },
  myNumberBox: { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 16, paddingHorizontal: 24, paddingVertical: 14, marginTop: 4 },
  myNumber: { fontSize: 32, fontWeight: "900", color: "#fff", letterSpacing: 3 },
  missionCard: { backgroundColor: "#fff", borderRadius: 20, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 3, gap: 10 },
  missionCardTitle: { fontSize: 12, fontWeight: "800", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.8 },
  missionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 4 },
  missionRowHighlight: { backgroundColor: "#f0f9ff", borderRadius: 12, padding: 12, marginTop: 4 },
  missionKey: { fontSize: 13, color: "#64748b", fontWeight: "600" },
  missionVal: { fontSize: 14, fontWeight: "700", color: "#0f172a" },
  manualCard: { backgroundColor: "#ecfdf5", borderRadius: 20, padding: 20, gap: 10, borderWidth: 1.5, borderColor: "#bbf7d0" },
  manualTitle: { fontSize: 15, fontWeight: "800", color: "#059669" },
  manualSub: { fontSize: 13, color: "#374151", lineHeight: 19 },
  confirmBtn: { backgroundColor: "#059669", borderRadius: 16, paddingVertical: 17, alignItems: "center", shadowColor: "#059669", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 8 },
  confirmBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  doneCard: { backgroundColor: "#fff", borderRadius: 24, padding: 32, alignItems: "center", gap: 14, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 6 },
  doneEmoji: { fontSize: 64 },
  doneTitle: { fontSize: 26, fontWeight: "900", color: "#059669" },
  doneSub: { fontSize: 14, color: "#64748b", textAlign: "center", lineHeight: 20 },
  amountBig: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  amountBigVal: { fontSize: 42, fontWeight: "900", color: "#00b9f5" },
  amountBigUnit: { fontSize: 16, fontWeight: "700", color: "#64748b" },
  homeBtn: { backgroundColor: "#1558f5", borderRadius: 16, paddingVertical: 16, width: "100%", alignItems: "center" },
  homeBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  walletBtn: { backgroundColor: "#f1f5f9", borderRadius: 16, paddingVertical: 14, width: "100%", alignItems: "center" },
  walletBtnText: { color: "#374151", fontWeight: "700", fontSize: 14 },
});