import { useState, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator, Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { walletApi } from "../../services/api";

const TX_LABELS: Record<string, { label: string; color: string }> = {
  CREDIT:   { label: "Paiement recu",      color: "#059669" },
  DEBIT:    { label: "Retrait",             color: "#ef4444" },
  BONUS:    { label: "Bonus",               color: "#7c3aed" },
  PENDING:  { label: "En attente",          color: "#d97706" },
};

export default function WalletScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [wallet, setWallet]   = useState<any>(null);
  const [ledger, setLedger]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [wRes, lRes] = await Promise.all([walletApi.get(), walletApi.getLedger()]);
      setWallet(wRes.data);
      setLedger(lRes.data?.items ?? lRes.data ?? []);
    } catch { setWallet(null); setLedger([]); }
    finally   { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, []);

  const handleWithdraw = () => {
    if (!wallet?.balance || wallet.balance < 500) {
      Alert.alert("Solde insuffisant", "Solde minimum de retrait : 500 FCFA.");
      return;
    }
    Alert.alert(
      "Retrait",
      `Confirmer le retrait de ${wallet.balance.toLocaleString("fr-FR")} FCFA sur votre Wave Money ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Confirmer",
          onPress: async () => {
            try {
              await walletApi.withdraw(wallet.balance, wallet.orangeMoneyNumber ?? "");
              Alert.alert("Demande envoyee", "Votre retrait a ete enregistre.");
              load();
            } catch {
              Alert.alert("Erreur", "Impossible de traiter le retrait.");
            }
          },
        },
      ],
    );
  };

  const balance  = wallet?.balance ?? 0;
  const pending  = wallet?.pending ?? 0;
  const totalEarned = wallet?.totalEarned ?? 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.push("/(tabs)/map")}>
          <Text style={styles.backArrow}>{"<"}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wallet</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#1558f5" />}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#1558f5" style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* Balance card */}
            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>Solde disponible</Text>
              <Text style={styles.balanceAmount}>{balance.toLocaleString("fr-FR")} <Text style={styles.balanceCurrency}>FCFA</Text></Text>
              <View style={styles.balanceRow}>
                <View style={styles.balanceStat}>
                  <Text style={styles.balanceStatLabel}>En attente</Text>
                  <Text style={styles.balanceStatValue}>{pending.toLocaleString("fr-FR")} F</Text>
                </View>
                <View style={[styles.balanceStat, { borderLeftWidth: 1, borderLeftColor: "rgba(255,255,255,0.2)" }]}>
                  <Text style={styles.balanceStatLabel}>Total cumule</Text>
                  <Text style={styles.balanceStatValue}>{totalEarned.toLocaleString("fr-FR")} F</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.withdrawBtn}
                onPress={handleWithdraw}
                activeOpacity={0.85}
              >
                <Text style={styles.withdrawBtnText}>{"\uD83D\uDCB3"} Retirer vers Wave Money</Text>
              </TouchableOpacity>
            </View>

            {/* Payment method */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Mode de paiement</Text>
              <View style={styles.payMethodRow}>
                <Text style={styles.payMethodIcon}>{"\uD83D\uDCB3"}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.payMethodName}>Wave Money</Text>
                  <Text style={styles.payMethodNumber}>
                    {wallet?.orangeMoneyNumber ?? wallet?.waveMoneyNumber ?? "Non renseigne"}
                  </Text>
                </View>
                <View style={styles.payMethodBadge}>
                  <Text style={styles.payMethodBadgeText}>Principal</Text>
                </View>
              </View>
            </View>

            {/* Transaction history */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Historique des paiements</Text>
              {ledger.length === 0 ? (
                <View style={styles.emptyLedger}>
                  <Text style={styles.emptyLedgerText}>Aucune transaction pour le moment.</Text>
                </View>
              ) : (
                ledger.slice(0, 20).map((tx: any, i: number) => {
                  const cfg = TX_LABELS[tx.type] ?? { label: tx.type, color: "#6b7280" };
                  const date = tx.createdAt
                    ? new Date(tx.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
                    : "";
                  return (
                    <View key={i} style={[styles.txRow, i > 0 && styles.txBorder]}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.txLabel}>{cfg.label}</Text>
                        {date ? <Text style={styles.txDate}>{date}</Text> : null}
                      </View>
                      <Text style={[styles.txAmount, { color: cfg.color }]}>
                        {tx.type === "DEBIT" ? "-" : "+"}{(tx.amount ?? 0).toLocaleString("fr-FR")} F
                      </Text>
                    </View>
                  );
                })
              )}
            </View>
          </>
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
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
  balanceCard: {
    backgroundColor: "#1558f5", borderRadius: 24, padding: 24,
    shadowColor: "#1558f5", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10,
    gap: 8,
  },
  balanceLabel: { fontSize: 12, fontWeight: "600", color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: 1 },
  balanceAmount: { fontSize: 40, fontWeight: "900", color: "#fff" },
  balanceCurrency: { fontSize: 18, fontWeight: "600", color: "rgba(255,255,255,0.7)" },
  balanceRow: { flexDirection: "row", marginTop: 4 },
  balanceStat: { flex: 1, paddingRight: 16, paddingLeft: 4 },
  balanceStatLabel: { fontSize: 10, color: "rgba(255,255,255,0.6)", fontWeight: "600", textTransform: "uppercase" },
  balanceStatValue: { fontSize: 15, fontWeight: "800", color: "#fff", marginTop: 2 },
  withdrawBtn: {
    backgroundColor: "#fff", borderRadius: 14, paddingVertical: 14, alignItems: "center", marginTop: 8,
  },
  withdrawBtnText: { color: "#1558f5", fontWeight: "800", fontSize: 15 },
  card: {
    backgroundColor: "#fff", borderRadius: 20, padding: 20,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
    gap: 14,
  },
  cardTitle: { fontSize: 15, fontWeight: "800", color: "#0f172a" },
  payMethodRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  payMethodIcon: { fontSize: 28 },
  payMethodName: { fontSize: 15, fontWeight: "700", color: "#0f172a" },
  payMethodNumber: { fontSize: 13, color: "#64748b", marginTop: 2 },
  payMethodBadge: { backgroundColor: "#ecfdf5", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  payMethodBadgeText: { fontSize: 11, fontWeight: "700", color: "#059669" },
  emptyLedger: { alignItems: "center", paddingVertical: 24 },
  emptyLedgerText: { fontSize: 13, color: "#94a3b8", fontWeight: "500" },
  txRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  txBorder: { borderTopWidth: 1, borderTopColor: "#f1f5f9" },
  txLabel: { fontSize: 14, fontWeight: "600", color: "#0f172a" },
  txDate: { fontSize: 11, color: "#94a3b8", marginTop: 2 },
  txAmount: { fontSize: 15, fontWeight: "800" },
});