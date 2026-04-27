import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, StatusBar, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { missionsApi } from '../../services/api';
import { useAuthStore } from '../../store';

const SERVICE_LABELS: Record<string, string> = {
  EXTERIOR: 'Lavage Exterieur',
  INTERIOR: 'Lavage Interieur',
  FULL: 'Lavage Complet',
};
const SERVICE_EMOJI: Record<string, string> = {
  EXTERIOR: '🚿',
  INTERIOR: '✨',
  FULL: '⭐',
};
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:     { label: 'En attente',  color: '#d97706', bg: '#fffbeb' },
  BOOKED:      { label: 'Reserve',     color: '#7c3aed', bg: '#f5f3ff' },
  ACCEPTED:    { label: 'Confirme',    color: '#1558f5', bg: '#eff6ff' },
  IN_PROGRESS: { label: 'En cours',    color: '#059669', bg: '#ecfdf5' },
  DONE:        { label: 'Termine',     color: '#374151', bg: '#f1f5f9' },
  CANCELLED:   { label: 'Annule',      color: '#ef4444', bg: '#fef2f2' },
};
const PRICES: Record<string, number> = { EXTERIOR: 1500, INTERIOR: 2500, FULL: 4000 };

const TABS = ['En cours', 'Historique'];

export default function MissionsScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState(0);

  const load = useCallback(async () => {
    try {
      const res = await missionsApi.getMy();
      setMissions(res.data || []);
    } catch {
      setMissions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, []);

  const onRefresh = () => { setRefreshing(true); load(); };

  const active = missions.filter((m) =>
    ['PENDING', 'BOOKED', 'ACCEPTED', 'IN_PROGRESS'].includes(m.status)
  );
  const history = missions.filter((m) =>
    ['DONE', 'CANCELLED'].includes(m.status)
  );
  const shown = tab === 0 ? active : history;

  if (!isAuthenticated) {
    return (
      <View style={styles.centerBlock}>
        <Text style={styles.lockEmoji}>🔒</Text>
        <Text style={styles.lockTitle}>Connectez-vous</Text>
        <Text style={styles.lockSub}>pour voir vos missions</Text>
        <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/login')}>
          <Text style={styles.loginBtnText}>Se connecter</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderItem = ({ item }: { item: any }) => {
    const st = STATUS_CONFIG[item.status] || { label: item.status, color: '#6b7280', bg: '#f9fafb' };
    const date = item.scheduledAt
      ? new Date(item.scheduledAt).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
      : item.createdAt
      ? new Date(item.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
      : '';

    return (
      <View>
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.75}
        onPress={() => router.push({ pathname: '/tracking/[id]', params: { id: item.id } })}
      >
        <View style={styles.cardLeft}>
          <View style={[styles.emojiBox, { backgroundColor: st.bg }]}>
            <Text style={styles.emoji}>{SERVICE_EMOJI[item.serviceType] || '🚗'}</Text>
          </View>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>{SERVICE_LABELS[item.serviceType] || item.serviceType}</Text>
          {item.fullAddress ? (
            <Text style={styles.cardAddr} numberOfLines={1}>{item.fullAddress}</Text>
          ) : null}
          {date ? <Text style={styles.cardDate}>{date}</Text> : null}
        </View>
        <View style={styles.cardRight}>
          <Text style={styles.cardPrice}>{PRICES[item.serviceType] || '—'} F</Text>
          <View style={[styles.badge, { backgroundColor: st.bg }]}>
            <Text style={[styles.badgeText, { color: st.color }]}>{st.label}</Text>
          </View>
        </View>
      </TouchableOpacity>
      {item.status === 'DONE' && (
        <TouchableOpacity
          style={styles.reviewBtn}
          onPress={() => router.push({ pathname: '/mission-review/[id]', params: { id: item.id } })}
          activeOpacity={0.8}
        >
          <Text style={styles.reviewBtnText}>{String.fromCodePoint(11088)} Donner mon avis</Text>
        </TouchableOpacity>
      )}
    </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes missions</Text>
        <View style={styles.tabRow}>
          {TABS.map((t, i) => (
            <TouchableOpacity key={t} onPress={() => setTab(i)}
              style={[styles.tabBtn, tab === i && styles.tabBtnActive]}>
              <Text style={[styles.tabBtnText, tab === i && styles.tabBtnTextActive]}>
                {t}{i === 0 && active.length > 0 ? ` (${active.length})` : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={loading ? [] : shown}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={shown.length === 0 ? styles.emptyContainer : styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1558f5" />}
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.emptyBlock}>
              <Text style={styles.emptyEmoji}>{tab === 0 ? '🚗' : '📋'}</Text>
              <Text style={styles.emptyTitle}>
                {tab === 0 ? 'Aucune mission en cours' : 'Aucun historique'}
              </Text>
              {tab === 0 && (
                <TouchableOpacity style={styles.ctaBtn} onPress={() => router.push('/booking')}>
                  <Text style={styles.ctaBtnText}>Reserver un lavage</Text>
                </TouchableOpacity>
              )}
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },

  header: {
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 58 : 44,
    paddingHorizontal: 20,
    paddingBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#0f172a', marginBottom: 16 },

  tabRow: { flexDirection: 'row', gap: 4 },
  tabBtn: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10,
    marginBottom: 0,
  },
  tabBtnActive: { backgroundColor: '#eff6ff' },
  tabBtnText: { fontSize: 14, fontWeight: '600', color: '#94a3b8' },
  tabBtnTextActive: { color: '#1558f5' },

  listContent: { padding: 16, gap: 12 },
  emptyContainer: { flex: 1 },

  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 18, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  cardLeft: {},
  emojiBox: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 22 },
  cardBody: { flex: 1, gap: 2 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  cardAddr: { fontSize: 12, color: '#64748b' },
  cardDate: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  cardRight: { alignItems: 'flex-end', gap: 6 },
  cardPrice: { fontSize: 14, fontWeight: '800', color: '#0f172a' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '700' },

  emptyBlock: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#64748b', marginBottom: 20 },
  ctaBtn: {
    backgroundColor: '#1558f5', paddingHorizontal: 28, paddingVertical: 14,
    borderRadius: 16, shadowColor: '#1558f5', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
  },
  ctaBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },

  centerBlock: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  lockEmoji: { fontSize: 48, marginBottom: 16 },
  lockTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  lockSub: { fontSize: 14, color: '#64748b', marginBottom: 24 },
  loginBtn: { backgroundColor: '#1558f5', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14 },
  loginBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  reviewBtn: {
    backgroundColor: '#eff6ff', borderRadius: 12, paddingVertical: 10, alignItems: 'center',
    marginTop: -4, marginHorizontal: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0,
  },
  reviewBtnText: { color: '#1558f5', fontWeight: '700', fontSize: 13 },
});