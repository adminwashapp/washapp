import { useState } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
  Alert, Image, StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { playDing } from "../../services/sound";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "../../store";
import { washerApi } from "../../services/api";
import { washerSocket } from "../../services/socket";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerForPushNotifications } from "../../services/notifications";
import { API_URL } from "../../services/api";
import axios from "axios";

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);

  const requestOtp = async () => {
    if (!email.trim()) return Alert.alert("Erreur", "Entrez votre email");
    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/washer/request-otp`, { email: email.trim().toLowerCase() });
      setStep("otp");
    } catch (e: any) {
      Alert.alert("Erreur", e.response?.data?.message || "Email non reconnu ou compte non approuve");
    } finally { setLoading(false); }
  };

  const verifyOtp = async () => {
    if (!code.trim()) return Alert.alert("Erreur", "Entrez le code recu");
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/washer/verify-otp`, { email: email.trim().toLowerCase(), code: code.trim() });
      const { accessToken, refreshToken, user } = res.data;
      await AsyncStorage.multiSet([["accessToken", accessToken], ["refreshToken", refreshToken]]);
      setAuth({ user, accessToken, refreshToken });
      playDing();
      try {
        const token = await registerForPushNotifications();
        if (token) await washerApi.updatePushToken(token);
      } catch {}
      router.replace("/(tabs)/missions");
    } catch (e: any) {
      Alert.alert("Code invalide", e.response?.data?.message || "Code incorrect ou expire");
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: "#040c24" }}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]} keyboardShouldPersistTaps="handled">
        <View style={styles.logoBox}>
          <Image source={require("../../assets/images/icon.png")} style={styles.logo} resizeMode="contain" />
          <Text style={styles.brand}>Washapp Washer</Text>
          <Text style={styles.sub}>Espace professionnel</Text>
        </View>

        <View style={styles.card}>
          {step === "email" ? (
            <>
              <Text style={styles.title}>Connexion</Text>
              <Text style={styles.hint}>Entrez votre email professionnel</Text>
              <TextInput
                style={styles.input} value={email} onChangeText={setEmail}
                placeholder="votre@email.com" placeholderTextColor="#666"
                keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
              />
              <TouchableOpacity style={styles.btn} onPress={requestOtp} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Recevoir mon code</Text>}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.title}>Code de verification</Text>
              <Text style={styles.hint}>Un code a 6 chiffres a ete envoye a{"\n"}{email}</Text>
              <TextInput
                style={[styles.input, styles.codeInput]} value={code} onChangeText={setCode}
                placeholder="000000" placeholderTextColor="#666"
                keyboardType="number-pad" maxLength={6}
              />
              <TouchableOpacity style={styles.btn} onPress={verifyOtp} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Valider</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.back} onPress={() => { setStep("email"); setCode(""); }}>
                <Text style={styles.backText}>Changer d adresse email</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: "center", padding: 24 },
  logoBox: { alignItems: "center", marginBottom: 32 },
  logo: { width: 80, height: 80, borderRadius: 20, marginBottom: 12 },
  brand: { fontSize: 26, fontWeight: "800", color: "#fff", letterSpacing: 1 },
  sub: { fontSize: 13, color: "#6b7bcc", marginTop: 4 },
  card: { backgroundColor: "#0d1631", borderRadius: 24, padding: 28, borderWidth: 1, borderColor: "#1a2550" },
  title: { fontSize: 22, fontWeight: "700", color: "#fff", marginBottom: 8 },
  hint: { fontSize: 14, color: "#8899cc", marginBottom: 24, lineHeight: 20 },
  input: { backgroundColor: "#111d3a", borderWidth: 1, borderColor: "#1e2d55", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, color: "#fff", fontSize: 16, marginBottom: 16 },
  codeInput: { fontSize: 28, fontWeight: "700", letterSpacing: 8, textAlign: "center" },
  btn: { backgroundColor: "#1558f5", borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  back: { marginTop: 16, alignItems: "center" },
  backText: { color: "#6b7bcc", fontSize: 14 },
});