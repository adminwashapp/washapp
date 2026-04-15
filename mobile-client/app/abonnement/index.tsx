import { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { subscriptionsApi } from "../../services/api";

const SERVICE_LABELS: Record<string, string> = {
  EXTERIOR: "Abonnement Exterieur",
  INTERIOR: "Abonnement Interieur",
  FULL: "Abonnement Complet",
};
const TOTAL = 11;

export default function AbonnementScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [sub, setSub] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    subscriptionsApi.getActive()
      .then(r => { setSub(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <View style={styles.center}><ActivityIndicator size="large" color="#1558f5" /></View>
  );

  const count = sub?.completedPaidWashesCount ?? 0;
  const pct = Math.min(100, (count / TOTAL) * 100);
  const remaining = Math.max(0, TOTAL - count);

  if (!sub) return (
    <View style={[styles.emptyContainer, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
        <Text style={styles.backArrow}>{"\u2190"}</Text>
      </TouchableOpacity>
      <View style={styles.emptyContent}>
        <Text style={styles.emptyEmoji}>{"📋"}</Text>
        <Text style={styles.emptyTitle}>Aucun abonnement actif</Text>
        <Text style={styles.emptySub}>Souscrivez a un abonnement pour 11 lavages + 1 offert.</Text>
        <TouchableOpacity style={styles.subscribeBtn} onPress={() => router.back()} activeOpacity={0.85}>
          <Text style={styles.subscribeBtnText}>Voir les formules</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <Text style={styles.backArrow}>{"\u2190"}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mon abonnement</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]} showsVerticalScrollIndicator={false}>

        {/* Carte principale */}
        <View style={styles.mainCard}>
          <Text style={styles.planLabel}>Formule active</Text>
          <Text style={styles.planName}>{SERVICE_LABELS[sub.serviceType] ?? sub.serviceType}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{sub.status === "ACTIVE" ? "Actif" : sub.status}</Text>
          </View>

          {/* Progression */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Lavages valides</Text>
              <Text style={styles.progressCount}>{count} / {TOTAL}</Text>
            </View>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${pct}%` as any }]} />
            </View>
          </View>
        </View>

        {/* Lavage offert */}
        {sub.freeWashAvailable ? (
          <View style={styles.freeCard}>
            <Text style={styles.freeEmoji}>{"🎁"}</Text>
            <Text style={styles.freeTitle}>Votre lavage offert est disponible !</Text>
            <Text style={styles.freeSub}>Reservez maintenant pour en profiter.</Text>
          </View>
        ) : (
          <View style={styles.statusCard}>
            <Text style={styles.statusCardTitle}>
              {remaining === 0 ? "🎁 Lavage offert pret !" : `Encore ${remaining} lavage${remaining > 1 ? "s" : ""} avant votre lavage offert`}
            </Text>
            {/* Mini dots progress */}
            <View style={styles.dotsRow}>
              {Array.from({ length: TOTAL }).map((_, i) => (
                <View key={i} style={[styles.dot, i < count && styles.dotFilled]} />
              ))}
              <View style={[styles.giftDot, sub.freeWashAvailable && styles.giftDotActive]}>
                <Text style={styles.giftEmoji}>{"🎁"}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{count}</Text>
            <Text style={styles.statLabel}>Lavages valides</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: "#059669" }]}>{sub.freeWashAvailable ? "1" : "0"}</Text>
            <Text style={styles.statLabel}>Lavage offert</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: "#f59e0b" }]}>{remaining}</Text>
            <Text style={styles.statLabel}>Restants</Text>
          </View>
        </View>

        {/* Historique */}
        {sub.missions && sub.missions.length > 0 && (
          <View style={styles.historyCard}>
            <Text style={styles.historyTitle}>Historique</Text>
            {sub.missions.map((m: any, i: number) => (
              <View key={m.id} style={styles.historyRow}>
                <View style={styles.historyNum}>
                  <Text style={styles.historyNumText}>{i + 1}</Text>
                </View>
                <View style={styles.historyInfo}>
                  <Text style={styles.historyAddress} numberOfLines={1}>{m.address || "Lavage valide"}</Text>
                  <Text style={styles.historyDate}>{m.validatedAt ? new Date(m.validatedAt).toLocaleDateString("fr-FR") : ""}</Text>
                </View>
                <Text style={styles.historyCheck}>{"✓"}</Text>
              </View>
            ))}
          </View>
        )}

        {/* CTA Reserver */}
        <TouchableOpacity style={styles.bookBtn} onPress={() => router.push("/(tabs)/map")} activeOpacity={0.85}>
          <Text style={styles.bookBtnText}>{"🚗"} Reserver un lavage</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f4ff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyContainer: { flex: 1, backgroundColor: "#f0f4ff", paddingHorizontal: 24 },
  emptyContent: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyEmoji: { fontSize: 64 },
  emptyTitle: { fontSize: 22, fontWeight: "900", color: "#0f172a" },
  emptySub: { fontSize: 14, color: "#64748b", textAlign: "center", lineHeight: 20 },
  subscribeBtn: { backgroundColor: "#1558f5", borderRadius: 16, paddingVertical: 14, paddingHorizontal: 28, marginTop: 8 },
  subscribeBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#e8f0fe" },
  backBtn: { width: 40, height: 40, backgroundColor: "#f0f4ff", borderRadius: 12, alignItems: "center", justifyContent: "center" },
  backArrow: { fontSize: 18, fontWeight: "700", color: "#0f172a" },
  headerTitle: { fontSize: 17, fontWeight: "900", color: "#0f172a" },
  scroll: { padding: 20, gap: 14 },
  mainCard: { backgroundColor: "#1558f5", borderRadius: 24, padding: 24, gap: 6 },
  planLabel: { fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: 0.8 },
  planName: { fontSize: 20, fontWeight: "900", color: "#fff" },
  statusBadge: { alignSelf: "flex-start", backgroundColor: "#4ade80", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginTop: 2 },
  statusText: { fontSize: 11, fontWeight: "800", color: "#14532d" },
  progressSection: { marginTop: 16, gap: 8 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  progressLabel: { fontSize: 13, fontWeight: "600", color: "rgba(255,255,255,0.8)" },
  progressCount: { fontSize: 22, fontWeight: "900", color: "#fff" },
  progressBg: { height: 14, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 7, overflow: "hidden" },
  progressFill: { height: 14, backgroundColor: "#60a5fa", borderRadius: 7 },
  freeCard: { backgroundColor: "#ecfdf5", borderRadius: 20, padding: 20, alignItems: "center", gap: 6, borderWidth: 2, borderColor: "#86efac" },
  freeEmoji: { fontSize: 48 },
  freeTitle: { fontSize: 16, fontWeight: "900", color: "#059669", textAlign: "center" },
  freeSub: { fontSize: 13, color: "#374151" },
  statusCard: { backgroundColor: "#fff", borderRadius: 20, padding: 18, gap: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
  statusCardTitle: { fontSize: 14, fontWeight: "800", color: "#0f172a" },
  dotsRow: { flexDirection: "row", alignItems: "center", gap: 4, flexWrap: "wrap" },
  dot: { width: 20, height: 20, borderRadius: 10, backgroundColor: "#e2e8f0" },
  dotFilled: { backgroundColor: "#1558f5" },
  giftDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center" },
  giftDotActive: { backgroundColor: "#dcfce7" },
  giftEmoji: { fontSize: 12 },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, backgroundColor: "#fff", borderRadius: 16, padding: 14, alignItems: "center", gap: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  statNum: { fontSize: 28, fontWeight: "900", color: "#1558f5" },
  statLabel: { fontSize: 11, fontWeight: "600", color: "#64748b", textAlign: "center" },
  historyCard: { backgroundColor: "#fff", borderRadius: 20, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
  historyTitle: { fontSize: 13, fontWeight: "800", color: "#0f172a", padding: 16, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  historyRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f8fafc" },
  historyNum: { width: 26, height: 26, borderRadius: 13, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center" },
  historyNumText: { fontSize: 12, fontWeight: "800", color: "#1558f5" },
  historyInfo: { flex: 1 },
  historyAddress: { fontSize: 13, fontWeight: "600", color: "#0f172a" },
  historyDate: { fontSize: 11, color: "#94a3b8" },
  historyCheck: { fontSize: 14, color: "#059669", fontWeight: "900" },
  bookBtn: { backgroundColor: "#1558f5", borderRadius: 18, paddingVertical: 17, alignItems: "center", shadowColor: "#1558f5", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 8 },
  bookBtnText: { color: "#fff", fontWeight: "900", fontSize: 16 },
});