import { useState } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { authApi } from "../../services/api";

export default function ResetPasswordScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const params  = useLocalSearchParams<{ phone?: string; email?: string }>();

  const [code,     setCode]     = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [done,     setDone]     = useState(false);

  const handleReset = async () => {
    if (code.length !== 6) { Alert.alert("Code invalide", "Le code doit contenir 6 chiffres."); return; }
    if (password.length < 6) { Alert.alert("Mot de passe trop court", "Minimum 6 caractères."); return; }
    if (password !== confirm) { Alert.alert("Erreur", "Les mots de passe ne correspondent pas."); return; }

    setLoading(true);
    try {
      const payload: any = { code, newPassword: password };
      if (params.phone) payload.phone = params.phone;
      else if (params.email) payload.email = params.email;
      await authApi.resetPassword(payload);
      setDone(true);
    } catch (e: any) {
      Alert.alert("Erreur", e.response?.data?.message || "Code invalide ou expiré.");
    } finally { setLoading(false); }
  };

  if (done) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }]}>
        <View style={styles.doneWrap}>
          <Text style={styles.doneEmoji}>🎉</Text>
          <Text style={styles.doneTitle}>Mot de passe mis à jour !</Text>
          <Text style={styles.doneSub}>Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</Text>
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={() => router.replace("/login")}
            activeOpacity={0.85}
          >
            <Text style={styles.submitBtnTxt}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        style={[styles.container, { paddingTop: insets.top }]}
        contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <Text style={styles.backArrow}>{"←"}</Text>
          <Text style={styles.backTxt}>Retour</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Nouveau mot de passe</Text>
        <Text style={styles.subtitle}>Saisissez le code reçu et choisissez un nouveau mot de passe.</Text>

        {/* OTP code */}
        <Text style={styles.label}>Code de vérification (6 chiffres)</Text>
        <TextInput
          style={[styles.input, styles.codeInput]}
          keyboardType="number-pad"
          maxLength={6}
          placeholder="• • • • • •"
          placeholderTextColor="#94a3b8"
          value={code}
          onChangeText={(t) => setCode(t.replace(/\D/g, ""))}
          textAlign="center"
        />

        {/* New password */}
        <Text style={styles.label}>Nouveau mot de passe</Text>
        <View style={styles.pwdWrap}>
          <TextInput
            style={[styles.input, { paddingRight: 52, marginBottom: 0 }]}
            secureTextEntry={!showPwd}
            placeholder="Minimum 6 caractères"
            placeholderTextColor="#94a3b8"
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPwd(!showPwd)} activeOpacity={0.7}>
            <Text style={styles.eyeEmoji}>{showPwd ? "🙈" : "👁"}</Text>
          </TouchableOpacity>
        </View>

        {/* Strength bar */}
        {password.length > 0 && (
          <View style={styles.strengthBar}>
            {[1,2,3,4].map((i) => (
              <View key={i} style={[styles.strengthSegment, {
                backgroundColor: password.length >= i * 3
                  ? (password.length >= 10 ? "#22c55e" : "#f59e0b")
                  : "#e2e8f0"
              }]} />
            ))}
          </View>
        )}

        {/* Confirm */}
        <Text style={[styles.label, { marginTop: 16 }]}>Confirmer le mot de passe</Text>
        <TextInput
          style={[styles.input, confirm && confirm !== password && { borderColor: "#ef4444" }]}
          secureTextEntry={!showPwd}
          placeholder="Répétez le mot de passe"
          placeholderTextColor="#94a3b8"
          value={confirm}
          onChangeText={setConfirm}
        />
        {confirm && confirm !== password && (
          <Text style={styles.errorTxt}>Les mots de passe ne correspondent pas</Text>
        )}

        <TouchableOpacity
          style={[styles.submitBtn, (loading || !code || !password || password !== confirm) && { opacity: 0.55 }]}
          onPress={handleReset}
          disabled={loading || !code || !password || password !== confirm}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.submitBtnTxt}>Réinitialiser le mot de passe</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity style={styles.retryBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <Text style={styles.retryBtnTxt}>Code expiré ? Renvoyer un code</Text>
        </TouchableOpacity>
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
  label: { fontSize: 13, fontWeight: "700", color: "#374151", marginBottom: 8 },
  input: {
    backgroundColor: "#fff", borderWidth: 1.5, borderColor: "#e2e8f0",
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 16, color: "#0f172a", marginBottom: 16,
  },
  codeInput: { fontSize: 24, fontWeight: "900", letterSpacing: 10, textAlign: "center" },
  pwdWrap: { position: "relative", marginBottom: 16 },
  eyeBtn: { position: "absolute", right: 16, top: 14 },
  eyeEmoji: { fontSize: 20 },
  strengthBar: { flexDirection: "row", gap: 4, marginBottom: 4 },
  strengthSegment: { flex: 1, height: 4, borderRadius: 2 },
  errorTxt: { fontSize: 12, color: "#ef4444", marginTop: -10, marginBottom: 12 },
  submitBtn: {
    backgroundColor: "#1558f5", borderRadius: 16, paddingVertical: 18, alignItems: "center", marginTop: 8,
    shadowColor: "#1558f5", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 8,
  },
  submitBtnTxt: { color: "#fff", fontWeight: "800", fontSize: 16 },
  retryBtn: { marginTop: 16, alignItems: "center" },
  retryBtnTxt: { fontSize: 13, color: "#64748b", fontWeight: "600" },
  doneWrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 12 },
  doneEmoji: { fontSize: 64 },
  doneTitle: { fontSize: 26, fontWeight: "900", color: "#059669", textAlign: "center" },
  doneSub: { fontSize: 14, color: "#64748b", textAlign: "center", lineHeight: 22 },
});