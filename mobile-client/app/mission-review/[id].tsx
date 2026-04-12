import { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, Image,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { missionsApi } from "../../services/api";

const BEFORE_PHOTOS = [
  "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=400",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
];
const AFTER_PHOTOS = [
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400",
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400",
];

export default function MissionReviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();

  const [rating, setRating] = useState(0);
  const [step, setStep] = useState("photos");
  const [wantsClaim, setWantsClaim] = useState(null);
  const [claimText, setClaimText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRatingDone = async () => {
    if (rating === 0) { Alert.alert("Veuillez attribuer une note"); return; }
    if (rating === 5) { await submitReview(false); }
    else { setStep("claim"); }
  };

  const submitReview = async (withClaim) => {
    setLoading(true);
    try {
      await missionsApi.rate(id, { rating, comment: withClaim ? claimText : undefined });
      setStep("done");
    } catch {
      Alert.alert("Erreur", "Impossible d'enregistrer votre avis.");
    } finally {
      setLoading(false);
    }
  };

  if (step === "done") {
    return (
      <View style={[styles.doneContainer, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
        <Text style={styles.doneEmoji}>{rating === 5 ? "\uD83D\uDE4C" : "\uD83D\uDC4D"}</Text>
        <Text style={styles.doneTitle}>Merci pour votre confiance !</Text>
        <Text style={styles.doneSub}>
          {rating === 5
            ? "Votre retour a ete enregistre. A tres bientot !"
            : "Votre reclamation a ete envoyee. Notre equipe la traite rapidement."}
        </Text>
        <TouchableOpacity style={styles.doneBtn} onPress={() => router.replace("/(tabs)/missions")} activeOpacity={0.85}>
          <Text style={styles.doneBtnText}>Retour a mes missions</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>{"<"}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {step === "photos" ? "Photos du service" : step === "rating" ? "Votre avis" : "Reclamation"}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {step === "photos" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photos avant la prestation</Text>
            <View style={styles.photosRow}>
              {BEFORE_PHOTOS.map((uri, i) => (
                <Image key={i} source={{ uri }} style={styles.photo} resizeMode="cover" />
              ))}
            </View>
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>Photos apres la prestation</Text>
            <View style={styles.photosRow}>
              {AFTER_PHOTOS.map((uri, i) => (
                <Image key={i} source={{ uri }} style={styles.photo} resizeMode="cover" />
              ))}
            </View>
            <TouchableOpacity style={[styles.primaryBtn, { marginTop: 32 }]} onPress={() => setStep("rating")} activeOpacity={0.85}>
              <Text style={styles.primaryBtnText}>Continuer</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === "rating" && (
          <View style={styles.section}>
            <Text style={styles.questionTitle}>Est-ce que tout s{"\u2019"}est bien passe ?</Text>
            <Text style={styles.questionSub}>Notez votre experience avec votre washer</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.7} style={styles.starBtn}>
                  <Text style={[styles.star, star <= rating && styles.starActive]}>
                    {star <= rating ? "\u2605" : "\u2606"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {rating > 0 && (
              <Text style={styles.ratingLabel}>
                {rating === 5 ? "Excellent !" : rating === 4 ? "Tres bien" : rating === 3 ? "Bien" : rating === 2 ? "Peut mieux faire" : "Decevant"}
              </Text>
            )}
            <TouchableOpacity
              style={[styles.primaryBtn, { marginTop: 32, opacity: rating === 0 ? 0.5 : 1 }]}
              onPress={handleRatingDone}
              disabled={loading || rating === 0}
              activeOpacity={0.85}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Valider mon avis</Text>}
            </TouchableOpacity>
          </View>
        )}

        {step === "claim" && wantsClaim === null && (
          <View style={styles.section}>
            <Text style={styles.questionTitle}>Souhaitez-vous faire une reclamation ?</Text>
            <Text style={styles.questionSub}>
              {"Vous avez attribue " + rating + (rating > 1 ? " etoiles." : " etoile.") + "\nSouhaitez-vous signaler un probleme ?"}
            </Text>
            <View style={styles.claimChoiceRow}>
              <TouchableOpacity style={[styles.claimChoiceBtn, styles.claimChoiceBtnYes]} onPress={() => setWantsClaim(true)} activeOpacity={0.85}>
                <Text style={styles.claimChoiceBtnText}>Oui, je signale</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.claimChoiceBtn, styles.claimChoiceBtnNo]} onPress={() => submitReview(false)} disabled={loading} activeOpacity={0.85}>
                {loading ? <ActivityIndicator color="#1558f5" /> : <Text style={[styles.claimChoiceBtnText, { color: "#1558f5" }]}>Non, c{"\u2019"}est bon</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {step === "claim" && wantsClaim === true && (
          <View style={styles.section}>
            <Text style={styles.questionTitle}>Expliquez le probleme</Text>
            <Text style={styles.questionSub}>Votre reclamation sera traitee dans les plus brefs delais.</Text>
            <TextInput
              style={styles.claimInput}
              value={claimText}
              onChangeText={setClaimText}
              placeholder="Decrivez le probleme rencontre..."
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[styles.primaryBtn, { marginTop: 16, opacity: claimText.trim().length < 10 ? 0.5 : 1 }]}
              onPress={() => submitReview(true)}
              disabled={loading || claimText.trim().length < 10}
              activeOpacity={0.85}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Envoyer la reclamation</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.skipBtn} onPress={() => submitReview(false)} activeOpacity={0.7}>
              <Text style={styles.skipBtnText}>Ignorer et terminer</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 16,
    backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#f1f5f9",
  },
  backBtn: { width: 40, height: 40, backgroundColor: "#f1f5f9", borderRadius: 12, alignItems: "center", justifyContent: "center" },
  backArrow: { fontSize: 20, color: "#0f172a", fontWeight: "700" },
  headerTitle: { fontSize: 17, fontWeight: "800", color: "#0f172a" },
  scroll: { paddingHorizontal: 20, paddingTop: 24 },
  section: { gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#0f172a", marginBottom: 8 },
  photosRow: { flexDirection: "row", gap: 12 },
  photo: { flex: 1, height: 160, borderRadius: 16 },
  divider: { height: 1, backgroundColor: "#e2e8f0", marginVertical: 8 },
  questionTitle: { fontSize: 22, fontWeight: "800", color: "#0f172a", textAlign: "center", marginTop: 16 },
  questionSub: { fontSize: 14, color: "#64748b", textAlign: "center", lineHeight: 20 },
  starsRow: { flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 24 },
  starBtn: { padding: 8 },
  star: { fontSize: 44, color: "#d1d5db" },
  starActive: { color: "#f59e0b" },
  ratingLabel: { fontSize: 16, fontWeight: "700", color: "#f59e0b", textAlign: "center", marginTop: 4 },
  claimChoiceRow: { flexDirection: "column", gap: 12, marginTop: 24 },
  claimChoiceBtn: { paddingVertical: 18, borderRadius: 16, alignItems: "center" },
  claimChoiceBtnYes: { backgroundColor: "#1558f5" },
  claimChoiceBtnNo: { backgroundColor: "#fff", borderWidth: 2, borderColor: "#1558f5" },
  claimChoiceBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
  claimInput: {
    backgroundColor: "#fff", borderWidth: 1.5, borderColor: "#e2e8f0",
    borderRadius: 16, padding: 16, fontSize: 15, color: "#0f172a", minHeight: 140,
  },
  primaryBtn: {
    backgroundColor: "#1558f5", borderRadius: 16, paddingVertical: 17, alignItems: "center",
    shadowColor: "#1558f5", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 8,
  },
  primaryBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  skipBtn: { alignItems: "center", paddingVertical: 14 },
  skipBtnText: { fontSize: 14, color: "#94a3b8", fontWeight: "600" },
  doneContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, backgroundColor: "#f8fafc" },
  doneEmoji: { fontSize: 72, marginBottom: 24 },
  doneTitle: { fontSize: 26, fontWeight: "900", color: "#0f172a", textAlign: "center", marginBottom: 12 },
  doneSub: { fontSize: 15, color: "#64748b", textAlign: "center", lineHeight: 22, marginBottom: 40 },
  doneBtn: { backgroundColor: "#1558f5", borderRadius: 16, paddingHorizontal: 32, paddingVertical: 17 },
  doneBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});