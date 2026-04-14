import { useState } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
  Alert, Image, StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "../../store";
import { authApi, washerApi } from "../../services/api";
import { washerSocket } from "../../services/socket";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerForPushNotifications } from "../../services/notifications";

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Champs requis", "Veuillez remplir tous les champs.");
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.loginWasher({ email: email.trim().toLowerCase(), password });
      const { accessToken, refreshToken, user } = res.data;
      await AsyncStorage.setItem("accessToken", accessToken);
      await AsyncStorage.setItem("refreshToken", refreshToken);
      await AsyncStorage.setItem("user", JSON.stringify(user));
      setAuth(user, accessToken, refreshToken);
      washerSocket.connect();
      registerForPushNotifications(washerApi.updateFcmToken).catch(() => {});
      router.replace("/(tabs)/map");
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      Alert.alert(
        "Connexion echouee",
        typeof msg === "string" ? msg : "Email ou mot de passe incorrect.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={[styles.inner, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.logoRow} onPress={() => router.back()} activeOpacity={0.7}>
            <Image source={require("../../assets/images/logowashapp.png")} style={styles.logo} resizeMode="contain" />
            <Text style={styles.brand}>Washapp</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Connexion</Text>
          <Text style={styles.subtitle}>Connectez-vous a votre espace washer</Text>

          <View style={styles.form}>
            {/* Email */}
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputRow}>
                <Ionicons name="mail-outline" size={18} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  style={styles.inputField}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="votre@email.com"
                  placeholderTextColor="#94a3b8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Mot de passe */}
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Mot de passe</Text>
              <View style={styles.inputRow}>
                <Ionicons name="lock-closed-outline" size={18} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  style={styles.inputField}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Votre mot de passe"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showPass}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPass(s => !s)} style={styles.eyeBtn}>
                  <Ionicons
                    name={showPass ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#64748b"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/(auth)/forgot-password" as any)}
            style={styles.forgotWrap}
            activeOpacity={0.8}
          >
            <Text style={styles.forgotText}>Mot de passe oublie ?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginBtn, loading && { opacity: 0.6 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.loginBtnText}>Se connecter</Text>
            }
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Pas encore washer ? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.footerLink}>Revenir</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  inner: { paddingHorizontal: 28, flexGrow: 1 },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 40 },
  logo: { width: 36, height: 36, borderRadius: 9 },
  brand: { fontSize: 20, fontWeight: "900", color: "#0f172a" },
  title: { fontSize: 30, fontWeight: "900", color: "#0f172a", marginBottom: 8, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: "#64748b", marginBottom: 36 },
  form: { gap: 16, marginBottom: 12 },
  fieldWrap: { gap: 6 },
  label: { fontSize: 13, fontWeight: "700", color: "#374151" },
  inputRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#fff", borderWidth: 1.5, borderColor: "#e2e8f0",
    borderRadius: 14, paddingHorizontal: 14,
  },
  inputIcon: { marginRight: 8 },
  inputField: { flex: 1, paddingVertical: 15, fontSize: 15, color: "#0f172a" },
  eyeBtn: { padding: 6 },
  forgotWrap: { alignSelf: "flex-end", marginBottom: 24 },
  forgotText: { fontSize: 13, color: "#1558f5", fontWeight: "600" },
  loginBtn: {
    backgroundColor: "#1558f5", borderRadius: 16, paddingVertical: 17,
    alignItems: "center", marginBottom: 24,
    shadowColor: "#1558f5", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 14, elevation: 8,
  },
  loginBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  footer: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  footerText: { fontSize: 13, color: "#64748b" },
  footerLink: { fontSize: 13, fontWeight: "700", color: "#1558f5" },
});