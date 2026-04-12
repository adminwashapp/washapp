import { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, Linking, Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { washerApi, authApi } from "../../services/api";
import { useAuthStore } from "../../store";
import { washerSocket } from "../../services/socket";
import AsyncStorage from "@react-native-async-storage/async-storage";

const WEB_URL = "http://localhost:3000";

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:  { label: "En attente",  color: "#d97706", bg: "#fffbeb" },
  ACTIVE:   { label: "Actif",       color: "#059669", bg: "#ecfdf5" },
  SUSPENDED:{ label: "Suspendu",    color: "#ef4444", bg: "#fef2f2" },
};
const TRANSPORT_LABELS: Record<string, string> = {
  BIKE: "Velo", SCOOTER: "Scooter", MOTORBIKE: "Moto",
};

export default function AccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, clearAuth } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    washerApi.getProfile()
      .then(r => setProfile(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    Alert.alert("Deconnexion", "Voulez-vous vous deconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Deconnecter",
        style: "destructive",
        onPress: async () => {
          washerSocket.goOffline();
          washerSocket.disconnect();
          const rt = await AsyncStorage.getItem("refreshToken");
          if (rt) authApi.logout(rt).catch(() => {});
          await AsyncStorage.multiRemove(["accessToken", "refreshToken", "user"]);
          clearAuth();
          router.replace("/(auth)/welcome");
        },
      },
    ]);
  };

  const acctStatus = STATUS_LABELS[profile?.accountStatus ?? "PENDING"]
    ?? { label: profile?.accountStatus, color: "#6b7280", bg: "#f9fafb" };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.push("/(tabs)/map")}>
          <Text style={styles.backArrow}>{"<"}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mon compte</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1558f5" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Profile card */}
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(user?.firstName?.[0] ?? "W").toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>
                {user?.firstName} {user?.lastName}
              </Text>
              <Text style={styles.profileRole}>Washer Washapp</Text>
              <View style={[styles.statusBadge, { backgroundColor: acctStatus.bg }]}>
                <Text style={[styles.statusBadgeText, { color: acctStatus.color }]}>{acctStatus.label}</Text>
              </View>
            </View>
            {profile?.rating != null && (
              <View style={styles.ratingBox}>
                <Text style={styles.ratingStar}>{"\u2B50"}</Text>
                <Text style={styles.ratingVal}>{Number(profile.rating).toFixed(1)}</Text>
              </View>
            )}
          </View>

          {/* Infos perso */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informations personnelles</Text>
            <InfoRow icon="\uD83D\uDCDE" label="Telephone"    value={user?.phone ?? profile?.phone ?? "—"} />
            <InfoRow icon="\uD83D\uDCE7" label="Email"        value={user?.email ?? "—"} />
          </View>

          {/* Infos washer */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profil washer</Text>
            <InfoRow icon="\uD83D\uDCCD" label="Ville / Zone"   value={`${profile?.city ?? ""} — ${profile?.zoneLabel ?? "—"}`} />
            <InfoRow icon="\uD83D\uDEB2" label="Transport"      value={TRANSPORT_LABELS[profile?.transportType ?? ""] ?? "—"} />
            <InfoRow icon="\uD83D\uDCB0" label="Wave Money"     value={profile?.orangeMoneyNumber ?? profile?.waveMoneyNumber ?? "Non renseigne"} />
          </View>

          {/* Support */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Aide & Support</Text>
            <MenuRow icon="\uD83D\uDCCB" label="FAQ"                     onPress={() => Linking.openURL(`${WEB_URL}/faq`)} />
            <MenuRow icon="\uD83D\uDCC4" label="Mentions legales"         onPress={() => Linking.openURL(`${WEB_URL}/legal`)} />
            <MenuRow icon="\uD83D\uDD12" label="Politique de confidentialite" onPress={() => Linking.openURL(`${WEB_URL}/legal`)} />
            <MenuRow icon="\uD83D\uDCE9" label="Contacter le support"     onPress={() => Linking.openURL("mailto:support@washapp.ci")} />
          </View>

          {/* Logout */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
            <Text style={styles.logoutBtnText}>{"\uD83D\uDEAA"} Se deconnecter</Text>
          </TouchableOpacity>

          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </View>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoRowIcon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoRowLabel}>{label}</Text>
        <Text style={styles.infoRowValue}>{value}</Text>
      </View>
    </View>
  );
}

function MenuRow({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.menuRowIcon}>{icon}</Text>
      <Text style={styles.menuRowLabel}>{label}</Text>
      <Text style={styles.menuRowChevron}>{">"}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 16,
    backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#f1f5f9",
  },
  backBtn: { width: 40, height: 40, backgroundColor: "#f1f5f9", borderRadius: 12, alignItems: "center", justifyContent: "center" },
  backArrow: { fontSize: 18, fontWeight: "700", color: "#0f172a" },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#0f172a" },
  scroll: { padding: 16, gap: 14 },
  profileCard: {
    flexDirection: "row", alignItems: "center", gap: 16,
    backgroundColor: "#fff", borderRadius: 20, padding: 20,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  avatar: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: "#1558f5",
    alignItems: "center", justifyContent: "center",
  },
  avatarText: { fontSize: 24, fontWeight: "900", color: "#fff" },
  profileName: { fontSize: 18, fontWeight: "900", color: "#0f172a" },
  profileRole: { fontSize: 12, color: "#64748b", marginTop: 2, fontWeight: "500" },
  statusBadge: { alignSelf: "flex-start", marginTop: 6, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  statusBadgeText: { fontSize: 11, fontWeight: "700" },
  ratingBox: { alignItems: "center" },
  ratingStar: { fontSize: 20 },
  ratingVal: { fontSize: 18, fontWeight: "900", color: "#0f172a" },
  section: {
    backgroundColor: "#fff", borderRadius: 20, padding: 20,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
    gap: 0,
  },
  sectionTitle: { fontSize: 13, fontWeight: "800", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 },
  infoRow: { flexDirection: "row", alignItems: "flex-start", gap: 14, paddingVertical: 10, borderTopWidth: 1, borderTopColor: "#f8fafc" },
  infoRowIcon: { fontSize: 18, lineHeight: 24 },
  infoRowLabel: { fontSize: 11, fontWeight: "600", color: "#94a3b8", textTransform: "uppercase" },
  infoRowValue: { fontSize: 14, fontWeight: "600", color: "#0f172a", marginTop: 2 },
  menuRow: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 14, borderTopWidth: 1, borderTopColor: "#f8fafc" },
  menuRowIcon: { fontSize: 18 },
  menuRowLabel: { flex: 1, fontSize: 14, fontWeight: "600", color: "#0f172a" },
  menuRowChevron: { fontSize: 16, color: "#cbd5e1", fontWeight: "700" },
  logoutBtn: {
    backgroundColor: "#fef2f2", borderRadius: 16, paddingVertical: 16, alignItems: "center",
    borderWidth: 1.5, borderColor: "#fecaca",
  },
  logoutBtnText: { color: "#ef4444", fontWeight: "800", fontSize: 15 },
});