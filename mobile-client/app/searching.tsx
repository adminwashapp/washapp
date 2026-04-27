import { useEffect, useRef, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { missionsApi } from "../services/api";

const SERVICE_LABELS: Record<string, string> = {
  EXTERIOR: "Lavage Extérieur",
  INTERIOR: "Lavage Intérieur",
  FULL:     "Lavage Complet",
};
const SERVICE_EMOJI: Record<string, string> = {
  EXTERIOR: "🚿", INTERIOR: "✨", FULL: "⭐",
};

export default function SearchingScreen() {
  const router   = useRouter();
  const insets   = useSafeAreaInsets();
  const { id, serviceType, address } = useLocalSearchParams<{
    id: string; serviceType: string; address: string;
  }>();

  const [elapsedSec, setElapsedSec] = useState(0);
  const [cancelling, setCancelling]  = useState(false);

  // Pulse animations (3 rings)
  const pulse1 = useRef(new Animated.Value(0)).current;
  const pulse2 = useRef(new Animated.Value(0)).current;
  const pulse3 = useRef(new Animated.Value(0)).current;

  const ring = (anim: Animated.Value, delay: number) =>
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1, duration: 2200, easing: Easing.out(Easing.quad), useNativeDriver: true,
        }),
        Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );

  useEffect(() => {
    const a1 = ring(pulse1, 0);
    const a2 = ring(pulse2, 700);
    const a3 = ring(pulse3, 1400);
    a1.start(); a2.start(); a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, []);

  // Timer counter
  useEffect(() => {
    const t = setInterval(() => setElapsedSec(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Poll mission status
  useEffect(() => {
    if (!id) return;
    const poll = setInterval(async () => {
      try {
        const res = await missionsApi.getById(id);
        const m = res.data;
        if (m.status === "ASSIGNED" || m.status === "EN_ROUTE" || m.status === "IN_PROGRESS") {
          clearInterval(poll);
          router.replace({ pathname: "/tracking/[id]", params: { id } } as any);
        }
        if (m.status === "CANCELLED" || m.status === "EXPIRED") {
          clearInterval(poll);
          Alert.alert("Mission annulée", "Aucun washer disponible pour le moment.", [
        { text: "OK", onPress: () => router.replace("/map") },
          ]);
        }
      } catch { /* network — retry next tick */ }
    }, 5000);
    return () => clearInterval(poll);
  }, [id]);

  const handleCancel = () => {
    Alert.alert("Annuler la demande ?", "Souhaitez-vous vraiment annuler ?", [
      { text: "Non", style: "cancel" },
      {
        text: "Oui, annuler",
        style: "destructive",
        onPress: async () => {
          setCancelling(true);
          try {
            if (id) await missionsApi.cancel(id);
          } catch {}
    router.replace("/map");
        },
      },
    ]);
  };

  const mkPulseStyle = (anim: Animated.Value) => ({
    opacity:    anim.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 0.4, 0] }),
    transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 3.5] }) }],
  });

  const mins = Math.floor(elapsedSec / 60);
  const secs = elapsedSec % 60;
  const elapsed = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 24 }]}>

      {/* Top info */}
      <View style={styles.topCard}>
        <Text style={styles.topLabel}>PRESTATION DEMANDÉE</Text>
        <Text style={styles.topService}>
          {SERVICE_EMOJI[serviceType] ?? "🚗"} {SERVICE_LABELS[serviceType] ?? "Lavage"}
        </Text>
        {address ? <Text style={styles.topAddress} numberOfLines={2}>📍 {address}</Text> : null}
      </View>

      {/* Radar */}
      <View style={styles.radarWrap}>
        <Animated.View style={[styles.pulseRing, mkPulseStyle(pulse1)]} />
        <Animated.View style={[styles.pulseRing, mkPulseStyle(pulse2)]} />
        <Animated.View style={[styles.pulseRing, mkPulseStyle(pulse3)]} />
        <View style={styles.radarCenter}>
          <Text style={styles.radarEmoji}>🚗</Text>
        </View>
      </View>

      {/* Status text */}
      <View style={styles.statusBlock}>
        <Text style={styles.statusTitle}>Recherche d{"'"}un washer à proximité...</Text>
        <Text style={styles.statusSub}>
          Nous trouvons le meilleur washer disponible près de vous.
        </Text>
        <View style={styles.timerPill}>
          <View style={styles.timerDot} />
          <Text style={styles.timerText}>{elapsed}</Text>
        </View>
      </View>

      {/* Tips */}
      <View style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>En attendant</Text>
        <Text style={styles.tipsItem}>• Assurez-vous que votre véhicule est accessible</Text>
        <Text style={styles.tipsItem}>• Restez disponible, le washer peut appeler</Text>
        <Text style={styles.tipsItem}>• La recherche prend généralement 2 à 5 minutes</Text>
      </View>

      {/* Cancel */}
      <TouchableOpacity
        style={[styles.cancelBtn, cancelling && { opacity: 0.6 }]}
        onPress={handleCancel}
        disabled={cancelling}
        activeOpacity={0.8}
      >
        <Text style={styles.cancelBtnText}>Annuler la demande</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: "#040c24",
    alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 24,
  },

  topCard: {
    width: "100%", backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 18, padding: 18, marginTop: 12, gap: 6,
  },
  topLabel: { fontSize: 10, fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: 1 },
  topService: { fontSize: 20, fontWeight: "900", color: "#fff" },
  topAddress: { fontSize: 13, color: "#94a3b8", fontWeight: "500" },

  radarWrap: { width: 200, height: 200, alignItems: "center", justifyContent: "center", marginVertical: 8 },
  pulseRing: {
    position: "absolute",
    width: 90, height: 90, borderRadius: 45,
    borderWidth: 2, borderColor: "#1558f5",
    backgroundColor: "transparent",
  },
  radarCenter: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: "#1558f5",
    alignItems: "center", justifyContent: "center",
    shadowColor: "#1558f5", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 20, elevation: 12,
  },
  radarEmoji: { fontSize: 36 },

  statusBlock: { alignItems: "center", gap: 8 },
  statusTitle: { fontSize: 18, fontWeight: "800", color: "#fff", textAlign: "center" },
  statusSub: { fontSize: 13, color: "#94a3b8", textAlign: "center", lineHeight: 19 },
  timerPill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(255,255,255,0.08)", paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
  },
  timerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#22c55e" },
  timerText: { color: "#fff", fontWeight: "800", fontSize: 14, fontVariant: ["tabular-nums" as any] },

  tipsCard: {
    width: "100%", backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16, padding: 16, gap: 6,
  },
  tipsTitle: { fontSize: 12, fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 },
  tipsItem: { fontSize: 13, color: "#94a3b8", lineHeight: 20 },

  cancelBtn: {
    width: "100%", backgroundColor: "rgba(239,68,68,0.12)",
    borderWidth: 1.5, borderColor: "rgba(239,68,68,0.3)",
    borderRadius: 16, paddingVertical: 16, alignItems: "center",
  },
  cancelBtnText: { color: "#ef4444", fontWeight: "700", fontSize: 15 },
});