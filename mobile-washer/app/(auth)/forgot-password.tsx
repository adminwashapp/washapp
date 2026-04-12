import { useState } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { authApi } from "../../services/api";

type Step = "form" | "sent";
type Mode = "phone" | "email";

export default function ForgotPasswordScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const [step, setStep]       = useState<Step>("form");
  const [mode, setMode]       = useState<Mode>("phone");
  const [value, setValue]     = useState("");
  const [loading, setLoading] = useState(false);
  const [devCode, setDevCode] = useState("");

  const handleSubmit = async () => {
    if (!value.trim()) { Alert.alert("Erreur", "Veuillez renseigner ce champ"); return; }
    setLoading(true);
    try {
      const payload = mode === "phone" ? { phone: value } : { email: value };
      const res = await authApi.forgotPassword(payload);
      setDevCode(res.data._devCode ?? "");
      setStep("sent");
    } catch (e: any) {
      Alert.alert("Erreur", e.response?.data?.message || "Une erreur est survenue.");
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        style={[styles.container, { paddingTop: insets.top }]}
        contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <Text style={styles.backArrow}>{"←"}</Text>
          <Text style={styles.backTxt}>Retour</Text>
        </TouchableOpacity>

        {step === "form" ? (
          <>
            <Text style={styles.title}>Mot de passe oublié</Text>
            <Text style={styles.subtitle}>
              Entrez votre identifiant. Vous recevrez un code à 6 chiffres.
            </Text>

            {/* Toggle */}
            <View style={styles.modeToggle}>
              {(["phone", "email"] as Mode[]).map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.modeBtn, mode === m && styles.modeBtnActive]}
                  onPress={() => { setMode(m); setValue(""); }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.modeBtnTxt, mode === m && styles.modeBtnTxtActive]}>
                    {m === "phone" ? "📱 Téléphone" : "✉️ Email"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>
              {mode === "phone" ? "Numéro de téléphone" : "Adresse email"}
            </Text>
            <TextInput
              style={styles.input}
              keyboardType={mode === "phone" ? "phone-pad" : "email-address"}
              autoCapitalize="none"
              placeholder={mode === "phone" ? "+225 07 00 00 00 00" : "exemple@email.com"}
              placeholderTextColor="#94a3b8"
              value={value}
              onChangeText={setValue}
            />

            <TouchableOpacity
              style={[styles.submitBtn, loading && { opacity: 0.6 }]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.submitBtnTxt}>Envoyer le code</Text>
              }
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.successIcon}>
              <Text style={{ fontSize: 36 }}>✅</Text>
            </View>
            <Text style={styles.title}>Code envoyé !</Text>
            <Text style={styles.subtitle}>
              Un code de réinitialisation a été généré.
              {mode === "phone" ? " Il sera envoyé par SMS." : " Vérifiez votre email."}
            </Text>

            {/* Dev mode */}
            {devCode ? (
              <View style={styles.devBox}>
                <Text style={styles.devLabel}>MODE DÉVELOPPEMENT</Text>
                <Text style={styles.devSubtitle}>Code de réinitialisation :</Text>
                <Text style={styles.devCode}>{devCode}</Text>
                <Text style={styles.devNote}>En production ce code sera envoyé par SMS/email.</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={() => router.push({
                pathname: "/(auth)/reset-password",
                params: { [mode]: value },
              } as any)}
              activeOpacity={0.85}
            >
              <Text style={styles.submitBtnTxt}>Saisir mon code →</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => { setStep("form"); setValue(""); setDevCode(""); }}
              activeOpacity={0.8}
            >
              <Text style={styles.retryBtnTxt}>Essayer un autre identifiant</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 32 },
  backArrow: { fontSize: 20, fontWeight: "700", color: "#0f172a" },
  backTxt: { fontSize: 14, fontWeight: "600", color: "#64748b" },
  title: { fontSize: 28, fontWeight: "900", color: "#0f172a", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#64748b", lineHeight: 22, marginBottom: 28 },
  modeToggle: { flexDirection: "row", gap: 10, marginBottom: 20, backgroundColor: "#f1f5f9", borderRadius: 14, padding: 4 },
  modeBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  modeBtnActive: { backgroundColor: "#fff", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  modeBtnTxt: { fontSize: 13, fontWeight: "600", color: "#64748b" },
  modeBtnTxtActive: { color: "#0f172a" },
  label: { fontSize: 13, fontWeight: "700", color: "#374151", marginBottom: 8 },
  input: {
    backgroundColor: "#fff", borderWidth: 1.5, borderColor: "#e2e8f0",
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 16, color: "#0f172a", marginBottom: 20,
  },
  submitBtn: {
    backgroundColor: "#1558f5", borderRadius: 16, paddingVertical: 18, alignItems: "center",
    shadowColor: "#1558f5", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 8,
  },
  submitBtnTxt: { color: "#fff", fontWeight: "800", fontSize: 16 },
  successIcon: { alignItems: "center", marginBottom: 16 },
  devBox: { backgroundColor: "#fffbeb", borderWidth: 1.5, borderColor: "#fde68a", borderRadius: 16, padding: 16, marginBottom: 20, gap: 4 },
  devLabel: { fontSize: 10, fontWeight: "800", color: "#92400e", textTransform: "uppercase", letterSpacing: 1 },
  devSubtitle: { fontSize: 12, color: "#b45309" },
  devCode: { fontSize: 32, fontWeight: "900", color: "#78350f", letterSpacing: 8, fontVariant: ["tabular-nums" as any] },
  devNote: { fontSize: 11, color: "#d97706", marginTop: 4 },
  retryBtn: { marginTop: 14, alignItems: "center" },
  retryBtnTxt: { fontSize: 14, color: "#64748b", fontWeight: "600" },
});