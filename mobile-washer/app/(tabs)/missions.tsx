import { useState, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { washerApi } from "../../services/api";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:     { label: "En attente",   color: "#d97706", bg: "#fffbeb" },
  ACCEPTED:    { label: "Acceptee",     color: "#1558f5", bg: "#eff6ff" },
  IN_PROGRESS: { label: "En cours",     color: "#7c3aed", bg: "#f5f3ff" },
  DONE:        { label: "Terminee",     color: "#059669", bg: "#ecfdf5" },
  CANCELLED:   { label: "Annulee",      color: "#ef4444", bg: "#fef2f2" },
  DISPUTE:     { label: "Litige",       color: "#dc2626", bg: "#fff1f2" },
};
const SERVICE_LABELS: Record<string, string> = {
  EXTERIOR: "Lavage Exterieur", INTERIOR: "Lavage Interieur", FULL: "Lavage Complet",
};
const SERVICE_ICON: Record<string, string> = {
  EXTERIOR: "Ext.", INTERIOR: "Int.", FULL: "Full",
};
const PRICES: Record<string, number> = { EXTERIOR: 1500, INTERIOR: 2500, FULL: 4000 };

export default function MissionsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [missions, setMissions] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState(0);

  const load = useCallback(async () => {
    try {
      const res = await washerApi.getReservations();
      setMissions(res.data || []);
    } catch { setMissions([]); }
    finally   { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, []);

  const upcoming = missions.filter(m => ["PENDING","ACCEPTED","IN_PROGRESS"].includes(m.status));
  const history  = missions.filter(m => ["DONE","CANCELLED","DISPUTE"].includes(m.status));
  const shown    = tab === 0 ? upcoming : history;

  const renderItem = ({ item }: { item: any }) => {
    const st = STATUS_CONFIG[item.status] ?? { label: item.status, color: "#6b7280", bg: "#f9fafb" };
    const date = item.scheduledAt
      ? new Date(item.scheduledAt).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
      : item.createdAt
      ? new Date(item.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
      : "";
    const price = item.price ?? PRICES[item.serviceType] ?? 0;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.75}
        onPress={() => router.push({ pathname: "/mission/[id]", params: { id: item.id } })}
      >
        <View style={[styles.iconBox, { backgroundColor: st.bg }]}>
          <Text style={styles.iconText}>{SERVICE_ICON[item.serviceType] ?? "?"}</Text>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>{SERVICE_LABELS[item.serviceType] ?? item.serviceType}</Text>
          {item.fullAddress ? (
            <Text style={styles.cardAddr} numberOfLines={1}>{item.fullAddress}</Text>
          ) : null}
          {date ? <Text style={styles.cardDate}>{date}</Text> : null}
        </View>
        <View style={styles.cardRight}>
          <Text style={styles.cardPrice}>{price.toLocaleString("fr-FR")} F</Text>
          <View style={[styles.badge, { backgroundColor: st.bg }]}>
            <Text style={[styles.badgeText, { color: st.color }]}>{st.label}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/(tabs)/map")} style={styles.backBtn}>
          <Text style={styles.backArrow}>{"<"}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes missions</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {[
          { label: "A venir",    count: upcoming.length },
          { label: "Historique", count: history.length  },
        ].map((t, i) => (
          <TouchableOpacity key={i} onPress={() => setTab(i)}
            style={[styles.tabBtn, tab === i && styles.tabBtnActive]}>
            <Text style={[styles.tabBtnText, tab === i && styles.tabBtnTextActive]}>
              {t.label}{t.count > 0 ? ` (${t.count})` : ""}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={loading ? [] : shown}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={shown.length === 0 ? styles.emptyContainer : styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#1558f5" />}
        ListEmptyComponent={loading ? null : (
          <View style={styles.emptyBlock}>
            <Text style={styles.emptyIcon}>{tab === 0 ? "[V]" : "[H]"}</Text>
            <Text style={styles.emptyTitle}>{tab === 0 ? "Aucune mission a venir" : "Aucun historique"}</Text>
          </View>
        )}
      />
    </View>
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
  tabRow: { flexDirection: "row", backgroundColor: "#fff", paddingHorizontal: 16, paddingBottom: 8, gap: 4 },
  tabBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  tabBtnActive: { backgroundColor: "#eff6ff" },
  tabBtnText: { fontSize: 14, fontWeight: "600", color: "#94a3b8" },
  tabBtnTextActive: { color: "#1558f5" },
  listContent: { padding: 16, gap: 12 },
  emptyContainer: { flex: 1 },
  emptyBlock: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80 },
  emptyIcon: { fontSize: 16, marginBottom: 16, color: "#94a3b8" },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: "#64748b" },
  card: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "#fff", borderRadius: 18, padding: 14,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  iconBox: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  iconText: { fontSize: 12, fontWeight: "700", color: "#374151" },
  cardBody: { flex: 1, gap: 2 },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#0f172a" },
  cardAddr: { fontSize: 12, color: "#64748b" },
  cardDate: { fontSize: 11, color: "#94a3b8", marginTop: 2 },
  cardRight: { alignItems: "flex-end", gap: 6 },
  cardPrice: { fontSize: 14, fontWeight: "800", color: "#0f172a" },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: "700" },
});