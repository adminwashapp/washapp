import { useState, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { washerApi } from "../../services/api";

const PERIODS = [
  { key: "day",   label: "Aujourd'hui" },
  { key: "week",  label: "Cette semaine" },
  { key: "month", label: "Ce mois" },
];

export default function EarningsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState("month");

  const load = useCallback(async () => {
    try {
      const res = await washerApi.getEarnings();
      setData(res.data);
    } catch { setData(null); }
    finally   { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, []);

  const periodData = data?.[period] ?? { total: 0, missions: 0, average: 0, exterior: 0, interior: 0, full: 0 };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.push("/map")}>
          <Text style={styles.backArrow}>{"<"}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes revenus</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#1558f5" />}
        showsVerticalScrollIndicator={false}
      >
        {/* Period selector */}
        <View style={styles.periodRow}>
          {PERIODS.map(p => (
            <TouchableOpacity
              key={p.key}
              style={[styles.periodBtn, period === p.key && styles.periodBtnActive]}
              onPress={() => setPeriod(p.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.periodText, period === p.key && styles.periodTextActive]}>{p.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#1558f5" style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* Main revenue card */}
            <View style={styles.mainCard}>
              <Text style={styles.mainLabel}>Revenus</Text>
              <Text style={styles.mainAmount}>
                {periodData.total.toLocaleString("fr-FR")} <Text style={styles.mainCurrency}>FCFA</Text>
              </Text>
              <View style={styles.mainStats}>
                <StatChip icon="[V]" label="Missions"  value={String(periodData.missions)} />
                <StatChip icon="[G]" label="Moyenne"   value={`${Math.round(periodData.average).toLocaleString("fr-FR")} F`} />
              </View>
            </View>

            {/* Breakdown */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Par type de lavage</Text>
              <BreakdownRow label="Lavage Exterieur" icon="Ext." amount={periodData.exterior} />
              <BreakdownRow label="Lavage Interieur" icon="Int." amount={periodData.interior} />
              <BreakdownRow label="Lavage Complet"   icon="Full" amount={periodData.full}     />
            </View>

            {/* Info note */}
            <View style={styles.infoNote}>
              <Text style={styles.infoNoteText}>
                {"[i] Les paiements sont verses via Wave Money apres chaque mission validee."}
              </Text>
            </View>
          </>
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

function StatChip({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.statChip}>
      <Text style={styles.statIcon}>{icon}</Text>
      <View>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
      </View>
    </View>
  );
}

function BreakdownRow({ label, icon, amount }: { label: string; icon: string; amount: number }) {
  return (
    <View style={styles.breakRow}>
      <Text style={styles.breakIcon}>{icon}</Text>
      <Text style={styles.breakLabel}>{label}</Text>
      <Text style={styles.breakAmount}>{amount.toLocaleString("fr-FR")} F</Text>
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
  scroll: { padding: 16, gap: 14 },
  periodRow: {
    flexDirection: "row", gap: 8,
    backgroundColor: "#fff", borderRadius: 16, padding: 6,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  periodBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: "center" },
  periodBtnActive: { backgroundColor: "#1558f5" },
  periodText: { fontSize: 12, fontWeight: "600", color: "#64748b" },
  periodTextActive: { color: "#fff" },
  mainCard: {
    backgroundColor: "#1558f5", borderRadius: 24, padding: 24, gap: 12,
    shadowColor: "#1558f5", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10,
  },
  mainLabel: { fontSize: 13, fontWeight: "600", color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: 1 },
  mainAmount: { fontSize: 40, fontWeight: "900", color: "#fff" },
  mainCurrency: { fontSize: 18, fontWeight: "600", color: "rgba(255,255,255,0.75)" },
  mainStats: { flexDirection: "row", gap: 12, marginTop: 4 },
  statChip: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, flex: 1,
  },
  statIcon: { fontSize: 14, color: "#fff" },
  statLabel: { fontSize: 10, fontWeight: "600", color: "rgba(255,255,255,0.7)" },
  statValue: { fontSize: 15, fontWeight: "800", color: "#fff" },
  card: {
    backgroundColor: "#fff", borderRadius: 20, padding: 20,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
    gap: 14,
  },
  cardTitle: { fontSize: 15, fontWeight: "800", color: "#0f172a" },
  breakRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 6, borderTopWidth: 1, borderTopColor: "#f1f5f9" },
  breakIcon: { fontSize: 12, fontWeight: "700", color: "#374151", width: 32 },
  breakLabel: { flex: 1, fontSize: 14, fontWeight: "600", color: "#374151" },
  breakAmount: { fontSize: 15, fontWeight: "800", color: "#0f172a" },
  infoNote: { backgroundColor: "#eff6ff", borderRadius: 16, padding: 16 },
  infoNoteText: { fontSize: 13, color: "#1558f5", fontWeight: "500", lineHeight: 20 },
});