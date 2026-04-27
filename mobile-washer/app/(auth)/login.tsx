import { useState } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
  Alert, Image, StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "../../store";
import { washerApi, API_URL } from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerForPushNotifications } from "../../services/notifications";
import axios from "axios";

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setAuth } = useAuthStore();

  const [identifier, setIdentifier] = useState(""); // telephone ou email
  const [password, setPassword]     = useState("");
  const [showPass, setShowPass]     = useState(false);
  const [loading, setLoading]       = useState(false);

  const login = async () => {
    const id = identifier.trim();
    const pw = password.trim();
    if (!id) return Alert.alert("Erreur", "Entrez votre numéro de téléphone ou email");
    if (!pw) return Alert.alert("Erreur", "Entrez votre mot de passe");

    setLoading(true);
    try {
      const isEmail = id.includes("@");
      const res = await axios.post(`${API_URL}/auth/login/washer`, {
        ...(isEmail ? { email: id.toLowerCase() } : { phone: id }),
        password: pw,
      });

      const { accessToken, refreshToken, user } = res.data;
      await AsyncStorage.multiSet([
        ["accessToken", accessToken],
        ["refreshToken", refreshToken],
      ]);
      setAuth({ user, accessToken, refreshToken });

      // Enregistrer le token push
      try {
        const pushToken = await registerForPushNotifications(() => Promise.resolve());
        if (pushToken) await washerApi.updateFcmToken(pushToken);
      } catch {}

      router.replace("/missions");
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Identifiants incorrects ou compte non approuvé";
      Alert.alert("Connexion impossible", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: "#040c24" }}
    >
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoBox}>
          <Image source={require("../../assets/images/icon.png")} style={styles.logo} resizeMode="contain" />
          <Text style={styles.brand}>Washapp Washer</Text>
          <Text style={styles.sub}>Espace professionnel</Text>
        </View>

        {/* Formulaire */}
        <View style={styles.card}>
          <Text style={styles.title}>Connexion</Text>

          {/* Champ identifiant */}
          <Text style={styles.label}>Numéro de téléphone ou email</Text>
          <TextInput
            style={styles.input}
            value={identifier}
            onChangeText={setIdentifier}
            placeholder="0033650090286 ou vous@email.com"
            placeholderTextColor="#4a5580"
            keyboardType="default"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Champ mot de passe */}
          <Text style={styles.label}>Mot de passe</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              value={password}
              onChangeText={setPassword}
              placeholder="Wash0000"
              placeholderTextColor="#4a5580"
              secureTextEntry={!showPass}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
              <Text style={{ color: "#6b7bcc", fontSize: 18 }}>{showPass ? "🙈" : "👁"}</Text>
            </TouchableOpacity>
          </View>

          {/* Bouton connexion */}
          <TouchableOpacity style={styles.btn} onPress={login} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Se connecter</Text>
            }
          </TouchableOpacity>

          <Text style={styles.hint}>
            Mot de passe temporaire : Wash + 4 derniers chiffres de votre téléphone{"\n"}
            Exemple : Wash0286
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: "center", padding: 24 },
  logoBox: { alignItems: "center", marginBottom: 32 },
  logo: { width: 90, height: 90, borderRadius: 22, marginBottom: 12 },
  brand: { fontSize: 26, fontWeight: "800", color: "#fff", letterSpacing: 1 },
  sub: { fontSize: 13, color: "#6b7bcc", marginTop: 4 },
  card: { backgroundColor: "#0d1631", borderRadius: 24, padding: 28, borderWidth: 1, borderColor: "#1a2550" },
  title: { fontSize: 24, fontWeight: "700", color: "#fff", marginBottom: 24 },
  label: { fontSize: 13, color: "#8899cc", fontWeight: "600", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  input: {
    backgroundColor: "#111d3a", borderWidth: 1, borderColor: "#1e2d55",
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
    color: "#fff", fontSize: 16, marginBottom: 20,
  },
  passwordRow: { flexDirection: "row", alignItems: "center", marginBottom: 20, gap: 8 },
  eyeBtn: { paddingHorizontal: 12, paddingVertical: 14 },
  btn: { backgroundColor: "#1558f5", borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 4 },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  hint: { marginTop: 20, fontSize: 12, color: "#4a5580", textAlign: "center", lineHeight: 18 },
});
