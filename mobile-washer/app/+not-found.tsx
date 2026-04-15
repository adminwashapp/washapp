import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function NotFoundScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 24 }]}>
      <Text style={styles.code}>404</Text>
      <Text style={styles.title}>Page introuvable</Text>
      <Text style={styles.sub}>Cette page n{"'"}existe pas ou a ete deplacee.</Text>
      <TouchableOpacity style={styles.btn} onPress={() => router.replace("/(tabs)/map")} activeOpacity={0.85}>
        <Text style={styles.btnText}>Retour a l{"'"}accueil</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", alignItems: "center", justifyContent: "center", padding: 32 },
  code: { fontSize: 80, fontWeight: "900", color: "#e2e8f0", letterSpacing: -4 },
  title: { fontSize: 24, fontWeight: "900", color: "#0f172a", marginTop: 8 },
  sub: { fontSize: 14, color: "#64748b", textAlign: "center", marginTop: 8, lineHeight: 20 },
  btn: { backgroundColor: "#1558f5", borderRadius: 16, paddingVertical: 16, paddingHorizontal: 32, marginTop: 32 },
  btnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
});