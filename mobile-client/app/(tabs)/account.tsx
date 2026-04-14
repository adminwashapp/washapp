import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Alert, Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store';

const WEB_URL = 'https://washapp.ci';

type MenuRow = {
  label: string;
  sub?: string;
  icon: string;
  action: () => void;
  danger?: boolean;
  external?: boolean;
};

type Section = { title: string; rows: MenuRow[] };

export default function AccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Deconnexion',
      'Voulez-vous vraiment vous deconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Deconnecter',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/welcome');
          },
        },
      ]
    );
  };

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'WA';

  const sections: Section[] = [
    {
      title: 'Informations',
      rows: [
        { icon: '[U]', label: 'Modifier le nom', sub: user?.name || '-', action: () => Alert.alert('Bientot disponible') },
        { icon: '[E]', label: "Modifier l'email", sub: user?.email || '-', action: () => Alert.alert('Bientot disponible') },
        { icon: '[T]', label: 'Modifier le telephone', sub: user?.phone || '-', action: () => Alert.alert('Bientot disponible') },
      ],
    },
    {
      title: 'Activite',
      rows: [
        { icon: '[D]', label: 'Mes reservations', action: () => router.push('/(tabs)/missions') },
        { icon: '[H]', label: 'Historique des lavages', action: () => router.push('/(tabs)/missions') },
      ],
    },
    {
      title: 'Aide',
      rows: [
        { icon: '[F]', label: 'FAQ', action: () => Linking.openURL(`${WEB_URL}/faq`), external: true },
        { icon: '[M]', label: 'Support / Contact', action: () => Alert.alert('Support', 'Ecrivez-nous : support@washapp.ci') },
        { icon: '[L]', label: 'Mentions legales', action: () => Linking.openURL(`${WEB_URL}/legal`), external: true },
        { icon: '[P]', label: 'Politique de confidentialite', action: () => Linking.openURL(`${WEB_URL}/legal`), external: true },
      ],
    },
    {
      title: 'Session',
      rows: [
        { icon: '[X]', label: 'Deconnexion', action: handleLogout, danger: true },
      ],
    },
  ];

  if (!isAuthenticated) {
    return (
      <View style={[styles.guestContainer, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.guestAvatarRing}>
          <Text style={styles.guestAvatarIcon}>{'[U]'}</Text>
        </View>
        <Text style={styles.guestTitle}>Mon compte</Text>
        <Text style={styles.guestSub}>{'Connectez-vous pour acceder\na votre espace personnel'}</Text>
        <TouchableOpacity style={styles.guestLoginBtn} onPress={() => router.push('/(auth)/login')} activeOpacity={0.85}>
          <Text style={styles.guestLoginBtnText}>Se connecter</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(auth)/register')} activeOpacity={0.7}>
          <Text style={styles.guestRegisterLink}>Creer un compte</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40 }]}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mon compte</Text>
      </View>

      {/* Profil */}
      <View style={styles.profileBlock}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user?.name || 'Client'}</Text>
          {user?.email ? <Text style={styles.profileDetail}>{user.email}</Text> : null}
          {user?.phone ? <Text style={styles.profileDetail}>{user.phone}</Text> : null}
        </View>
      </View>

      {/* Sections */}
      {sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionLabel}>{section.title.toUpperCase()}</Text>
          <View style={styles.sectionCard}>
            {section.rows.map((row, i) => (
              <TouchableOpacity
                key={row.label}
                style={[styles.row, i < section.rows.length - 1 && styles.rowBorder]}
                onPress={row.action}
                activeOpacity={0.65}
              >
                <Text style={styles.rowIcon}>{row.icon}</Text>
                <View style={styles.rowContent}>
                  <Text style={[styles.rowLabel, row.danger && styles.rowLabelDanger]}>{row.label}</Text>
                  {row.sub ? <Text style={styles.rowSub}>{row.sub}</Text> : null}
                </View>
                <Text style={[styles.rowChevron, row.external && styles.rowExternal]}>
                  {row.external ? '[>]' : '>'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scroll: { paddingHorizontal: 20 },

  header: { marginBottom: 24 },
  headerTitle: { fontSize: 26, fontWeight: '700', color: '#0f172a', letterSpacing: -0.6 },

  profileBlock: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 28, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#1558f5', alignItems: 'center', justifyContent: 'center', shadowColor: '#1558f5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4 },
  avatarText: { fontSize: 20, fontWeight: '700', color: '#fff' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 17, fontWeight: '600', color: '#0f172a', letterSpacing: -0.3, marginBottom: 3 },
  profileDetail: { fontSize: 13, color: '#94a3b8', fontWeight: '400', marginTop: 1 },

  section: { marginBottom: 24 },
  sectionLabel: { fontSize: 11, fontWeight: '600', color: '#94a3b8', letterSpacing: 1.2, marginBottom: 10, marginLeft: 4 },
  sectionCard: { backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },

  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 16, gap: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  rowIcon: { fontSize: 14, width: 26, textAlign: 'center', color: '#374151' },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: 15, fontWeight: '500', color: '#1e293b', letterSpacing: -0.2 },
  rowLabelDanger: { color: '#ef4444', fontWeight: '500' },
  rowSub: { fontSize: 12, color: '#94a3b8', marginTop: 1, fontWeight: '400' },
  rowChevron: { fontSize: 20, color: '#cbd5e1', fontWeight: '300' },
  rowExternal: { fontSize: 14, color: '#94a3b8' },

  guestContainer: { flex: 1, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  guestAvatarRing: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  guestAvatarIcon: { fontSize: 16, color: '#374151' },
  guestTitle: { fontSize: 22, fontWeight: '600', color: '#0f172a', marginBottom: 8, letterSpacing: -0.4 },
  guestSub: { fontSize: 14, color: '#94a3b8', textAlign: 'center', lineHeight: 20, marginBottom: 28, fontWeight: '400' },
  guestLoginBtn: { backgroundColor: '#1558f5', borderRadius: 16, paddingVertical: 15, paddingHorizontal: 48, marginBottom: 12, shadowColor: '#1558f5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 },
  guestLoginBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  guestRegisterLink: { fontSize: 14, color: '#1558f5', fontWeight: '500' },
});