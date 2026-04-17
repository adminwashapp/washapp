import { useRef, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Image, Animated,
  Linking, Dimensions, StatusBar, ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");
const WEB_URL = "http://localhost:3000";

export default function WelcomeScreen() {
  const router    = useRouter();
  const insets    = useSafeAreaInsets();
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <ImageBackground
      source={require("../../assets/images/Pagewasher.png")}
      style={styles.bg}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />
      {/* Overlay sombre */}
      <View style={styles.overlay} />

      <Animated.View
        style={[
          styles.content,
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 },
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Logo */}
        <View style={styles.logoRow}>
          <Image
            source={require("../../assets/images/logowashapp.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.brand}>Washapp</Text>
        </View>

        <View style={styles.spacer} />

        {/* Titre */}
        <View style={styles.textBlock}>
          <Text style={styles.title}>Travaillez avec Washapp</Text>
          <Text style={styles.subtitle}>
            Recevez des missions de lavage autour de vous et{"\n"}
            gerez votre activite directement depuis l&apos;app.
          </Text>
        </View>

        {/* Badges */}
        <View style={styles.badges}>
          {["Paiement Wave", "Missions instantanees", "Secteur libre"].map(b => (
            <View key={b} style={styles.badge}>
              <Text style={styles.badgeText}>{b}</Text>
            </View>
          ))}
        </View>

        {/* Boutons */}
        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => router.push("/(auth)/login")}
            activeOpacity={0.85}
          >
            <Text style={styles.btnPrimaryText}>Se connecter</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={() => Linking.openURL(`${WEB_URL}/postuler`)}
            activeOpacity={0.8}
          >
            <Text style={styles.btnSecondaryText}>Devenir washer</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, width: "100%", height: "100%" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(4,12,36,0.60)",
  },
  content: { flex: 1, paddingHorizontal: 28 },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  logo: { width: 40, height: 40, borderRadius: 10 },
  brand: { fontSize: 22, fontWeight: "900", color: "#fff", letterSpacing: -0.5 },
  spacer: { flex: 1 },
  textBlock: { marginBottom: 24 },
  title: {
    fontSize: 34, fontWeight: "900", color: "#fff",
    lineHeight: 40, marginBottom: 14, letterSpacing: -0.5,
  },
  subtitle: { fontSize: 15, color: "rgba(255,255,255,0.75)", lineHeight: 22 },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 28 },
  badge: {
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
  },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  buttons: { gap: 12 },
  btnPrimary: {
    backgroundColor: "#1558f5", borderRadius: 16, paddingVertical: 17,
    alignItems: "center",
    shadowColor: "#1558f5", shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5, shadowRadius: 16, elevation: 10,
  },
  btnPrimaryText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  btnSecondary: {
    backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 16,
    paddingVertical: 17, alignItems: "center",
    borderWidth: 1.5, borderColor: "rgba(255,255,255,0.25)",
  },
  btnSecondaryText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});