import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../store';
import { useBookingStore } from '../store';
import { missionsApi, clientsApi } from '../services/api';

const SERVICES = [
  { key: 'EXTERIOR', emoji: '🚿', label: 'Lavage Exterieur', price: 1500, desc: 'Carrosserie, vitres, jantes' },
  { key: 'INTERIOR', emoji: '✨', label: 'Lavage Interieur', price: 2500, desc: 'Habitacle, tapis, sieges' },
  { key: 'FULL',     emoji: '⭐', label: 'Lavage Complet',  price: 4000, desc: 'Exterieur + Interieur complet' },
];
const PAYMENT_METHODS = [
  { key: 'WAVE_MONEY', emoji: '\uD83D\uDCB3', label: 'Wave Money', sub: 'Paiement mobile securise' },
  { key: 'CASH', emoji: '\uD83E\uDD1D', label: 'Remise au washer', sub: 'Remis directement au washer avant la prestation' },
];
const STEPS = ['Prestation', 'Localisation', 'Paiement', 'Confirmation'];

export default function BookingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ serviceType?: string; missionType?: string }>();
  const { user, isAuthenticated } = useAuthStore();
  const {
    serviceType, setService,
    missionType, setMissionType,
    address, setLocation,
    vehicleId, setVehicle,
    scheduledAt, setScheduledAt,
    setMissionId, reset,
  } = useBookingStore();

  const [step, setStep] = useState(0);
  const [addressText, setAddressText] = useState(address || '');
  const [payMethod, setPayMethod] = useState<'WAVE_MONEY' | 'CASH'>('WAVE_MONEY');
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateText, setDateText] = useState('');

  useEffect(() => {
    if (params.serviceType) setService(params.serviceType as any);
    if (params.missionType) setMissionType(params.missionType as any);
    if (!isAuthenticated) { router.replace('/(auth)/login'); return; }
    clientsApi.getVehicles().then((r) => setVehicles(r.data || [])).catch(() => {});
  }, []);

  const next = () => {
    if (step === 0 && !serviceType) { Alert.alert('Choisissez une prestation'); return; }
    if (step === 1 && !addressText.trim()) { Alert.alert('Entrez votre adresse'); return; }
    setStep((s) => Math.min(s + 1, 3));
  };
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const handleConfirm = async () => {
    if (!serviceType) return;
    setLoading(true);
    try {
      setLocation(addressText, 5.3599517, -4.0082563);
      const payload: any = {
        serviceType,
        missionType: missionType || 'INSTANT',
        fullAddress: addressText,
        lat: 5.3599517,
        lng: -4.0082563,
        paymentMethod: payMethod,
      };
      if (vehicleId) payload.vehicleId = vehicleId;
      if (missionType === 'BOOKING' && dateText) payload.scheduledAt = new Date(dateText).toISOString();

      const res = await missionsApi.create(payload);
      const newId = res.data.id;
      setMissionId(newId);
      reset();
      if (missionType === 'INSTANT') {
        router.replace({
          pathname: '/searching',
          params: { id: newId, serviceType, address: addressText },
        } as any);
      } else {
        Alert.alert(
          'Réservation enregistrée !',
          'Votre réservation a bien été prise en compte. Vous pouvez suivre son statut dans Mes réservations.',
          [{ text: 'OK', onPress: () => router.replace('/(tabs)/missions') }]
        );
      }
    } catch (e: any) {
      Alert.alert('Erreur', e.response?.data?.message || 'Impossible de creer la mission');
    } finally {
      setLoading(false);
    }
  };

  const selectedService = SERVICES.find((s) => s.key === serviceType);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => step === 0 ? router.back() : prev()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reserver un lavage</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress */}
      <View style={styles.progress}>
        {STEPS.map((s, i) => (
          <View key={s} style={styles.stepWrap}>
            <View style={[styles.stepDot, i <= step && styles.stepDotActive, i < step && styles.stepDotDone]}>
              {i < step ? (
                <Text style={styles.stepCheck}>✓</Text>
              ) : (
                <Text style={[styles.stepNum, i <= step && styles.stepNumActive]}>{i + 1}</Text>
              )}
            </View>
            {i < STEPS.length - 1 && <View style={[styles.stepLine, i < step && styles.stepLineActive]} />}
          </View>
        ))}
      </View>
      <Text style={styles.stepLabel}>{STEPS[step]}</Text>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* STEP 0 — Prestation */}
        {step === 0 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Choisissez votre prestation</Text>
            <View style={styles.serviceList}>
              {SERVICES.map((s) => (
                <TouchableOpacity
                  key={s.key}
                  style={[styles.serviceCard, serviceType === s.key && styles.serviceCardActive]}
                  onPress={() => setService(s.key as any)}
                  activeOpacity={0.75}
                >
                  <View style={styles.serviceCardLeft}>
                    <Text style={styles.serviceEmoji}>{s.emoji}</Text>
                    <View>
                      <Text style={[styles.serviceLabel, serviceType === s.key && styles.textActive]}>{s.label}</Text>
                      <Text style={styles.serviceDesc}>{s.desc}</Text>
                    </View>
                  </View>
                  <View style={styles.serviceCardRight}>
                    <Text style={[styles.servicePrice, serviceType === s.key && styles.textActive]}>{s.price.toLocaleString('fr-FR')} F</Text>
                    {serviceType === s.key && <View style={styles.checkCircle}><Text style={styles.checkMark}>✓</Text></View>}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.stepTitle2}>Type de mission</Text>
            <View style={styles.missionTypeRow}>
              {[{ key: 'INSTANT', emoji: '⚡', label: 'Instantanee' }, { key: 'BOOKING', emoji: '📅', label: 'Reservee' }].map((m) => (
                <TouchableOpacity
                  key={m.key}
                  style={[styles.missionTypeCard, missionType === m.key && styles.missionTypeCardActive]}
                  onPress={() => setMissionType(m.key as any)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.missionTypeEmoji}>{m.emoji}</Text>
                  <Text style={[styles.missionTypeLabel, missionType === m.key && styles.textActive]}>{m.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* STEP 1 — Localisation */}
        {step === 1 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Adresse du vehicule</Text>
            <Text style={styles.stepSub}>Ou se trouve votre vehicule ?</Text>
            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Adresse complete</Text>
              <TextInput
                style={styles.textArea}
                value={addressText}
                onChangeText={setAddressText}
                placeholder="Ex : Cocody Riviera 3, face pharmacie..."
                multiline
                numberOfLines={3}
              />
            </View>

            {vehicles.length > 0 && (
              <View style={styles.inputWrap}>
                <Text style={styles.inputLabel}>Vehicule (optionnel)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 4 }}>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    {vehicles.map((v) => (
                      <TouchableOpacity
                        key={v.id}
                        style={[styles.vehicleChip, vehicleId === v.id && styles.vehicleChipActive]}
                        onPress={() => setVehicle(v.id)}
                      >
                        <Text style={[styles.vehicleChipText, vehicleId === v.id && styles.textActive]}>
                          🚗 {v.brand} {v.model}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            {missionType === 'BOOKING' && (
              <View style={styles.inputWrap}>
                <Text style={styles.inputLabel}>Date et heure souhaitees</Text>
                <TextInput
                  style={styles.inputField}
                  value={dateText}
                  onChangeText={setDateText}
                  placeholder="Ex : 2025-03-20 14:00"
                />
              </View>
            )}
          </View>
        )}

        {/* STEP 2 — Paiement */}
        {step === 2 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Moyen de paiement</Text>
            <Text style={styles.stepSub}>Le paiement est effectue avant le debut du lavage</Text>
            {PAYMENT_METHODS.map((pm) => (
              <TouchableOpacity
                key={pm.key}
                style={[styles.payCard, payMethod === pm.key && styles.payCardActive]}
                onPress={() => setPayMethod(pm.key as any)}
                activeOpacity={0.75}
              >
                <Text style={styles.payEmoji}>{pm.emoji}</Text>
                <View style={styles.payInfo}>
                  <Text style={[styles.payLabel, payMethod === pm.key && styles.textActive]}>{pm.label}</Text>
                  <Text style={styles.paySub}>{pm.sub}</Text>
                </View>
                {payMethod === pm.key && <View style={styles.checkCircle}><Text style={styles.checkMark}>✓</Text></View>}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* STEP 3 — Recap */}
        {step === 3 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Confirmation</Text>
            <View style={styles.recapCard}>
              <View style={styles.recapRow}>
                <Text style={styles.recapKey}>Prestation</Text>
                <Text style={styles.recapVal}>{selectedService?.label || '—'}</Text>
              </View>
              <View style={[styles.recapRow, styles.recapBorder]}>
                <Text style={styles.recapKey}>Type</Text>
                <Text style={styles.recapVal}>{missionType === 'INSTANT' ? '⚡ Instantanee' : '📅 Reservee'}</Text>
              </View>
              <View style={[styles.recapRow, styles.recapBorder]}>
                <Text style={styles.recapKey}>Adresse</Text>
                <Text style={styles.recapVal} numberOfLines={2}>{addressText}</Text>
              </View>
              {missionType === 'BOOKING' && dateText && (
                <View style={[styles.recapRow, styles.recapBorder]}>
                  <Text style={styles.recapKey}>Date</Text>
                  <Text style={styles.recapVal}>{dateText}</Text>
                </View>
              )}
              <View style={[styles.recapRow, styles.recapBorder]}>
                <Text style={styles.recapKey}>Paiement</Text>
                <Text style={styles.recapVal}>{payMethod === 'WAVE_MONEY' ? 'Wave Money' : 'Remise au washer'}</Text>
              </View>
              <View style={[styles.recapRow, styles.recapBorder, styles.recapTotal]}>
                <Text style={styles.totalKey}>Total</Text>
                <Text style={styles.totalVal}>{selectedService?.price.toLocaleString('fr-FR')} FCFA</Text>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomBar, { paddingHorizontal: 20, paddingTop: 16, paddingBottom: insets.bottom + 16 }]}>
        {step < 3 ? (
          <TouchableOpacity style={styles.nextBtn} onPress={next} activeOpacity={0.85}>
            <Text style={styles.nextBtnText}>Continuer →</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.confirmBtn, loading && { opacity: 0.6 }]}
            onPress={handleConfirm}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.confirmBtnText}>✅  Confirmer la reservation</Text>
            }
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 56 : 44, paddingHorizontal: 20, paddingBottom: 16,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  backBtn: { width: 40, height: 40, backgroundColor: '#f1f5f9', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 20, color: '#0f172a' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#0f172a' },

  progress: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: 20, paddingBottom: 4, backgroundColor: '#fff' },
  stepWrap: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  stepDot: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: '#e2e8f0',
    alignItems: 'center', justifyContent: 'center',
  },
  stepDotActive: { backgroundColor: '#1558f5' },
  stepDotDone: { backgroundColor: '#059669' },
  stepNum: { fontSize: 12, fontWeight: '700', color: '#94a3b8' },
  stepNumActive: { color: '#fff' },
  stepCheck: { fontSize: 13, color: '#fff', fontWeight: '800' },
  stepLine: { flex: 1, height: 2, backgroundColor: '#e2e8f0', marginHorizontal: 4 },
  stepLineActive: { backgroundColor: '#059669' },
  stepLabel: { textAlign: 'center', fontSize: 12, fontWeight: '600', color: '#64748b', backgroundColor: '#fff', paddingBottom: 12 },

  scroll: { paddingHorizontal: 20, paddingTop: 16 },
  stepContent: { gap: 16 },
  stepTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  stepTitle2: { fontSize: 17, fontWeight: '700', color: '#0f172a', marginTop: 4 },
  stepSub: { fontSize: 14, color: '#64748b', marginTop: -8 },

  serviceList: { gap: 10 },
  serviceCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', borderRadius: 18, padding: 16,
    borderWidth: 2, borderColor: '#f1f5f9',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  serviceCardActive: { borderColor: '#1558f5', backgroundColor: '#f0f5ff' },
  serviceCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  serviceEmoji: { fontSize: 28 },
  serviceLabel: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  serviceDesc: { fontSize: 12, color: '#64748b', marginTop: 2 },
  serviceCardRight: { alignItems: 'flex-end', gap: 4 },
  servicePrice: { fontSize: 16, fontWeight: '800', color: '#0f172a' },

  missionTypeRow: { flexDirection: 'row', gap: 12 },
  missionTypeCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 18,
    alignItems: 'center', gap: 8, borderWidth: 2, borderColor: '#f1f5f9',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  missionTypeCardActive: { borderColor: '#1558f5', backgroundColor: '#f0f5ff' },
  missionTypeEmoji: { fontSize: 26 },
  missionTypeLabel: { fontSize: 13, fontWeight: '700', color: '#0f172a' },

  checkCircle: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#1558f5', alignItems: 'center', justifyContent: 'center' },
  checkMark: { fontSize: 12, color: '#fff', fontWeight: '800' },
  textActive: { color: '#1558f5' },

  inputWrap: { gap: 8 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#374151' },
  textArea: {
    borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 14,
    padding: 14, fontSize: 15, color: '#0f172a', backgroundColor: '#fff',
    minHeight: 80, textAlignVertical: 'top',
  },
  inputField: {
    borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 15,
    color: '#0f172a', backgroundColor: '#fff',
  },
  vehicleChip: {
    paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#f1f5f9',
    borderRadius: 12, borderWidth: 2, borderColor: '#f1f5f9',
  },
  vehicleChipActive: { borderColor: '#1558f5', backgroundColor: '#eff6ff' },
  vehicleChipText: { fontSize: 13, fontWeight: '600', color: '#374151' },

  payCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#fff',
    borderRadius: 18, padding: 18, borderWidth: 2, borderColor: '#f1f5f9',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  payCardActive: { borderColor: '#1558f5', backgroundColor: '#f0f5ff' },
  payEmoji: { fontSize: 28 },
  payInfo: { flex: 1 },
  payLabel: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  paySub: { fontSize: 12, color: '#64748b', marginTop: 2 },

  recapCard: {
    backgroundColor: '#fff', borderRadius: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 16, elevation: 4,
    overflow: 'hidden',
  },
  recapRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 16, gap: 12 },
  recapBorder: { borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  recapKey: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  recapVal: { fontSize: 14, fontWeight: '700', color: '#0f172a', flex: 1, textAlign: 'right' },
  recapTotal: { backgroundColor: '#f8fafc' },
  totalKey: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  totalVal: { fontSize: 20, fontWeight: '900', color: '#1558f5' },

  bottomBar: {
    padding: 20, backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#f1f5f9',
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
  },
  nextBtn: {
    backgroundColor: '#1558f5', borderRadius: 16, paddingVertical: 17, alignItems: 'center',
    shadowColor: '#1558f5', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 14, elevation: 8,
  },
  nextBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  confirmBtn: {
    backgroundColor: '#059669', borderRadius: 16, paddingVertical: 17, alignItems: 'center',
    shadowColor: '#059669', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 8,
  },
  confirmBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});