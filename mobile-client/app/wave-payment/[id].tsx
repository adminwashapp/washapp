import { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
  ScrollView, Alert, Linking, TextInput, Clipboard,
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
  EXTERIOR: 1500, INTERIOR: 2500, FULL: 4000,
};

export default function WavePaymentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [mission, setMission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [txCode, setTxCode] = useState("");
  const [step, setStep] = useState<"send"|"code"|"done">("send");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    missionsApi.getMission(id)
      .then(r => { setMission(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const washerWaveNumber = mission?.washer?.waveMoneyNumber || "---";
  const amount = mission?.price ?? PRICE_MAP[mission?.serviceType] ?? 0;
  const serviceLabel = SERVICE_LABELS[mission?.serviceType] ?? "Lavage";
  const washerName = mission?.washer?.user?.name || "Votre washer";

  const copyNumber = () => {
    Clipboard.setString(washerWaveNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openWaveApp = () => {
    Linking.openURL("market://details?id=com.wave.clientapp").catch(() =>
      Linking.openURL("https://wave.com/fr-CI/")
    );
    setTimeout(() => setStep("code"), 1500);
  };

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await paymentsApi.confirmCashClient(id);
      setStep("done");
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      if (typeof msg === "string" && msg.includes("deja")) {
        setStep("done");
      } else {
        Alert.alert("Erreur", "Impossible de confirmer le paiement. Reessayez.");
      }
    } finally { setConfirming(false); }
  };

  if (loading) return (
    <View style={styles.center}><ActivityIndicator size="large" color="#00b9f5" /></View>
  );

  const stepIdx = step === "send" ? 0 : step === "code" ? 1 : 2;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <Text style={styles.backArrow}>{"\u2190"}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paiement Wave Money</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]} showsVerticalScrollIndicator={false}>

        <View style={styles.stepsRow}>
          {["Envoyer","Code","Confirme"].map((s, i) => (
            <View key={s} style={styles.stepItem}>
              <View style={[styles.stepBubble, i < stepIdx ? styles.stepDone : i === stepIdx ? styles.stepActive : styles.stepPending]}>
                <Text style={styles.stepBubbleText}>{i < stepIdx ? "\u2713" : i + 1}</Text>
              </View>
              <Text style={[styles.stepItemLabel, i === stepIdx && styles.stepItemLabelActive]}>{s}</Text>
              {i < 2 && <View style={[styles.stepLine, i < stepIdx && styles.stepLineDone]} />}
            </View>
          ))}
        </View>

        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Montant a payer</Text>
          <Text style={styles.amountValue}>{amount.toLocaleString()} FCFA</Text>
          <Text style={styles.amountService}>{serviceLabel}</Text>
        </View>

        {step === "send" && (
          <>
            <View style={styles.waveCard}>
              <Text style={styles.sectionTitle}>Numero Wave de votre washer</Text>
              <View style={styles.numberRow}>
                <View style={styles.numberBox}>
                  <Text style={styles.waveNumber}>{washerWaveNumber}</Text>
                </View>
                <TouchableOpacity style={[styles.copyBtn, copied && styles.copyBtnDone]} onPress={copyNumber} activeOpacity={0.8}>
                  <Text style={styles.copyBtnText}>{copied ? "\u2713" : "Copier"}</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.washerName}>{washerName}</Text>
            </View>

            <View style={styles.instructCard}>
              <Text style={styles.instructTitle}>Comment payer ?</Text>
              {[
                "Appuyez sur Ouvrir Wave ci-dessous",
                `Envoyez ${amount.toLocaleString()} FCFA au ${washerWaveNumber}`,
                "Dans la note ecrivez Washapp",
                "Notez le code de transaction Wave recu",
                "Revenez ici et saisissez le code",
              ].map((text, i) => (
                <View key={i} style={styles.instructRow}>
                  <View style={styles.instructNum}><Text style={styles.instructNumText}>{i + 1}</Text></View>
                  <Text style={styles.instructText}>{text}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.openWaveBtn} onPress={openWaveApp} activeOpacity={0.85}>
              <Text style={styles.openWaveW}>W</Text>
              <Text style={styles.openWaveBtnText}>Ouvrir Wave</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.skipBtn} onPress={() => setStep("code")} activeOpacity={0.8}>
              <Text style={styles.skipBtnText}>{"J'ai deja envoye \u2192"}</Text>
            </TouchableOpacity>
          </>
        )}

        {step === "code" && (
          <>
            <View style={styles.codeCard}>
              <Text style={styles.codeTitle}>Saisissez votre code Wave</Text>
              <Text style={styles.codeSub}>Apres votre envoi, Wave vous envoie un code de transaction par SMS. Entrez-le ici pour confirmer.</Text>
              <View style={styles.codeInputWrap}>
                <Text style={styles.codeInputLabel}>Code de transaction (optionnel)</Text>
                <TextInput
                  style={styles.codeInput}
                  value={txCode}
                  onChangeText={v => setTxCode(v.toUpperCase())}
                  placeholder="Ex : WV-123456"
                  placeholderTextColor="#94a3b8"
                  autoCapitalize="characters"
                  autoCorrect={false}
                  maxLength={20}
                />
                <Text style={styles.codeHint}>Ce code figure dans le SMS ou la notif Wave</Text>
              </View>
              <View style={styles.recapBox}>
                <View style={styles.recapRow}>
                  <Text style={styles.recapKey}>Destinataire</Text>
                  <Text style={styles.recapVal}>{washerName}</Text>
                </View>
                <View style={styles.recapRow}>
                  <Text style={styles.recapKey}>Numero Wave</Text>
                  <Text style={styles.recapVal}>{washerWaveNumber}</Text>
                </View>
                <View style={styles.recapRow}>
                  <Text style={styles.recapKey}>Montant</Text>
                  <Text style={[styles.recapVal, { color: "#00b9f5", fontWeight: "900" }]}>{amount.toLocaleString()} FCFA</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={[styles.confirmBtn, confirming && { opacity: 0.6 }]} onPress={handleConfirm} disabled={confirming} activeOpacity={0.85}>
              {confirming ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmBtnText}>{"\u2705"}  Confirmer mon paiement</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.backBtn2} onPress={() => setStep("send")} activeOpacity={0.8}>
              <Text style={styles.backBtn2Text}>{"\u2190"} Retour</Text>
            </TouchableOpacity>
          </>
        )}

        {step === "done" && (
          <View style={styles.doneCard}>
            <Text style={styles.doneEmoji}>{"\u2705"}</Text>
            <Text style={styles.doneTitle}>Paiement confirme !</Text>
            <Text style={styles.doneSub}>Votre washer a bien recu la confirmation de paiement Wave.</Text>
            {txCode.trim() !== "" && (
              <View style={styles.txBox}>
                <Text style={styles.txLabel}>Votre reference</Text>
                <Text style={styles.txCode}>{txCode}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.reviewBtn} onPress={() => router.replace({ pathname: "/mission-review/[id]", params: { id } })} activeOpacity={0.85}>
              <Text style={styles.reviewBtnText}>{"\u2B50"} Noter la prestation</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.homeBtn} onPress={() => router.replace("/(tabs)/missions")} activeOpacity={0.8}>
              <Text style={styles.homeBtnText}>Retour aux missions</Text>
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
  stepsRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 18, padding: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  stepItem: { flex: 1, alignItems: "center", position: "relative" },
  stepBubble: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  stepDone: { backgroundColor: "#059669" },
  stepActive: { backgroundColor: "#00b9f5" },
  stepPending: { backgroundColor: "#e2e8f0" },
  stepBubbleText: { color: "#fff", fontSize: 13, fontWeight: "900" },
  stepItemLabel: { fontSize: 10, fontWeight: "700", color: "#94a3b8", marginTop: 4 },
  stepItemLabelActive: { color: "#00b9f5" },
  stepLine: { position: "absolute", top: 15, left: "50%", right: "-50%", height: 2, backgroundColor: "#e2e8f0" },
  stepLineDone: { backgroundColor: "#059669" },
  amountCard: { backgroundColor: "#00b9f5", borderRadius: 22, padding: 26, alignItems: "center", shadowColor: "#00b9f5", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 12 },
  amountLabel: { fontSize: 13, color: "rgba(255,255,255,0.8)", fontWeight: "700", marginBottom: 6 },
  amountValue: { fontSize: 44, fontWeight: "900", color: "#fff", letterSpacing: -1 },
  amountService: { fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 4 },
  waveCard: { backgroundColor: "#fff", borderRadius: 20, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 3, gap: 10 },
  sectionTitle: { fontSize: 12, fontWeight: "800", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.8 },
  numberRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  numberBox: { flex: 1, backgroundColor: "#f0f9ff", borderRadius: 14, padding: 14, borderWidth: 2, borderColor: "#bae6fd" },
  waveNumber: { fontSize: 26, fontWeight: "900", color: "#0369a1", letterSpacing: 2 },
  copyBtn: { backgroundColor: "#00b9f5", paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12 },
  copyBtnDone: { backgroundColor: "#059669" },
  copyBtnText: { color: "#fff", fontWeight: "800", fontSize: 13 },
  washerName: { fontSize: 14, color: "#64748b", fontWeight: "600" },
  instructCard: { backgroundColor: "#fff", borderRadius: 20, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3, gap: 10 },
  instructTitle: { fontSize: 15, fontWeight: "800", color: "#0f172a" },
  instructRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  instructNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: "#e0f2fe", alignItems: "center", justifyContent: "center" },
  instructNumText: { fontSize: 12, fontWeight: "800", color: "#0369a1" },
  instructText: { flex: 1, fontSize: 14, color: "#374151", lineHeight: 20 },
  openWaveBtn: { backgroundColor: "#00b9f5", borderRadius: 18, paddingVertical: 18, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 12, shadowColor: "#00b9f5", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 14, elevation: 8 },
  openWaveW: { fontSize: 16, fontWeight: "900", color: "#fff", width: 30, height: 30, backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 15, textAlign: "center", lineHeight: 30 },
  openWaveBtnText: { color: "#fff", fontWeight: "900", fontSize: 16 },
  skipBtn: { alignItems: "center", paddingVertical: 10 },
  skipBtnText: { fontSize: 14, fontWeight: "700", color: "#0369a1" },
  codeCard: { backgroundColor: "#fff", borderRadius: 20, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 3, gap: 14 },
  codeTitle: { fontSize: 18, fontWeight: "900", color: "#0f172a" },
  codeSub: { fontSize: 13, color: "#64748b", lineHeight: 19 },
  codeInputWrap: { gap: 6 },
  codeInputLabel: { fontSize: 13, fontWeight: "700", color: "#374151" },
  codeInput: { borderWidth: 2, borderColor: "#bae6fd", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 18, fontWeight: "800", color: "#0f172a", backgroundColor: "#f0f9ff", letterSpacing: 2 },
  codeHint: { fontSize: 11, color: "#94a3b8", fontStyle: "italic" },
  recapBox: { backgroundColor: "#f8fafc", borderRadius: 14, padding: 14, gap: 8 },
  recapRow: { flexDirection: "row", justifyContent: "space-between" },
  recapKey: { fontSize: 13, color: "#64748b", fontWeight: "600" },
  recapVal: { fontSize: 13, fontWeight: "700", color: "#0f172a" },
  confirmBtn: { backgroundColor: "#059669", borderRadius: 18, paddingVertical: 18, alignItems: "center", shadowColor: "#059669", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 8 },
  confirmBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  backBtn2: { alignItems: "center", paddingVertical: 12 },
  backBtn2Text: { fontSize: 14, fontWeight: "600", color: "#64748b" },
  doneCard: { backgroundColor: "#fff", borderRadius: 24, padding: 28, alignItems: "center", gap: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 6 },
  doneEmoji: { fontSize: 64 },
  doneTitle: { fontSize: 24, fontWeight: "900", color: "#059669" },
  doneSub: { fontSize: 14, color: "#64748b", textAlign: "center", lineHeight: 20 },
  txBox: { backgroundColor: "#f0f9ff", borderRadius: 14, padding: 14, width: "100%", alignItems: "center", borderWidth: 1.5, borderColor: "#bae6fd" },
  txLabel: { fontSize: 11, fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  txCode: { fontSize: 20, fontWeight: "900", color: "#0369a1", letterSpacing: 2 },
  reviewBtn: { backgroundColor: "#1558f5", borderRadius: 16, paddingVertical: 16, paddingHorizontal: 32, width: "100%", alignItems: "center", marginTop: 8 },
  reviewBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  homeBtn: { backgroundColor: "#f1f5f9", borderRadius: 16, paddingVertical: 14, paddingHorizontal: 32, width: "100%", alignItems: "center" },
  homeBtnText: { color: "#64748b", fontWeight: "700", fontSize: 14 },
});