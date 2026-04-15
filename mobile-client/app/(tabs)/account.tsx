import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Alert, Linking, Modal, TextInput, Switch, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store';
import { clientsApi } from '../../services/api';

const WEB_URL = 'https://washapp.ci';

const ICON = {
  user:      '\uD83D\uDC64',
  email:     '\uD83D\uDCE7',
  phone:     '\uD83D\uDCF1',
  car:       '\uD83D\uDE97',
  add:       '\u2795',
  clipboard: '\uD83D\uDCCB',
  clock:     '\uD83D\uDD52',
  faq:       '\u2753',
  chat:      '\uD83D\uDCAC',
  doc:       '\uD83D\uDCC4',
  lock:      '\uD83D\uDD12',
  door:      '\uD83D\uDEAA',
  star:      '\u2B50',
  arrow:     '\u2197\uFE0F',
};

type Vehicle = {
  id: string;
  brand: string;
  model: string;
  color: string;
  licensePlate: string;
  isFavorite?: boolean;
};

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

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [plate, setPlate] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [savingVehicle, setSavingVehicle] = useState(false);

  useEffect(() => {
    if (isAuthenticated) fetchVehicles();
  }, [isAuthenticated]);

  const fetchVehicles = async () => {
    setLoadingVehicles(true);
    try {
      const res = await clientsApi.getVehicles();
      setVehicles(res.data || []);
    } catch {
      setVehicles([]);
    } finally {
      setLoadingVehicles(false);
    }
  };

  const handleAddVehicle = async () => {
    if (!brand.trim() || !model.trim() || !color.trim() || !plate.trim()) {
      Alert.alert('Champs requis', 'Veuillez remplir tous les champs.');
      return;
    }
    setSavingVehicle(true);
    try {
      await clientsApi.addVehicle({ brand, model, color, licensePlate: plate, isFavorite });
      await fetchVehicles();
      setShowAddModal(false);
      setBrand(''); setModel(''); setColor(''); setPlate(''); setIsFavorite(false);
      Alert.alert('\u2705 V\u00E9hicule ajout\u00E9', 'Votre v\u00E9hicule a \u00E9t\u00E9 enregistr\u00E9 avec succ\u00E8s.');
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.message || 'Impossible d\'ajouter le v\u00E9hicule.');
    } finally {
      setSavingVehicle(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'D\u00E9connexion',
      'Voulez-vous vraiment vous d\u00E9connecter\u00A0?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'D\u00E9connecter',
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
        { icon: ICON.user,  label: 'Modifier le nom',        sub: user?.name  || '-', action: () => Alert.alert('Bient\u00F4t disponible') },
        { icon: ICON.email, label: "Modifier l'email",       sub: user?.email || '-', action: () => Alert.alert('Bient\u00F4t disponible') },
        { icon: ICON.phone, label: 'Modifier le t\u00E9l\u00E9phone', sub: user?.phone || '-', action: () => Alert.alert('Bient\u00F4t disponible') },
      ],
    },
    {
      title: 'Activit\u00E9',
      rows: [
        { icon: ICON.clipboard, label: 'Mes r\u00E9servations',     action: () => router.push('/(tabs)/missions') },
        { icon: ICON.clock,     label: 'Historique des lavages', action: () => router.push('/(tabs)/missions') },
        { icon: '\u2B50', label: 'Mon abonnement', action: () => router.push('/abonnement') },
      ],
    },
    {
      title: 'Aide',
      rows: [
        { icon: ICON.faq,  label: 'FAQ',                          action: () => Linking.openURL(`${WEB_URL}/faq`),   external: true },
        { icon: ICON.chat, label: 'Support\u00A0/ Contact',       action: () => Alert.alert('Support', '\u00C9crivez-nous\u00A0: support@washapp.ci') },
        { icon: ICON.doc,  label: 'Mentions l\u00E9gales',        action: () => Linking.openURL(`${WEB_URL}/legal`), external: true },
        { icon: ICON.lock, label: 'Politique de confidentialit\u00E9', action: () => Linking.openURL(`${WEB_URL}/legal`), external: true },
      ],
    },
    {
      title: 'Session',
      rows: [
        { icon: ICON.door, label: 'D\u00E9connexion', action: handleLogout, danger: true },
      ],
    },
  ];

  if (!isAuthenticated) {
    return (
      <View style={[styles.guestContainer, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.guestAvatarRing}>
          <Text style={styles.guestAvatarIcon}>{ICON.user}</Text>
        </View>
        <Text style={styles.guestTitle}>Mon compte</Text>
        <Text style={styles.guestSub}>{'Connectez-vous pour acc\u00E9der\n\u00E0 votre espace personnel'}</Text>
        <TouchableOpacity style={styles.guestLoginBtn} onPress={() => router.push('/(auth)/login')} activeOpacity={0.85}>
          <Text style={styles.guestLoginBtnText}>Se connecter</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(auth)/register')} activeOpacity={0.7}>
          <Text style={styles.guestRegisterLink}>Cr\u00E9er un compte</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
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

        {/* Mes vehicules */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>MES V\u00C9HICULES</Text>
          <View style={styles.sectionCard}>
            {loadingVehicles ? (
              <View style={styles.row}>
                <ActivityIndicator size="small" color="#1558f5" />
                <Text style={[styles.rowLabel, { marginLeft: 12 }]}>Chargement...</Text>
              </View>
            ) : vehicles.length === 0 ? (
              <View style={[styles.row, styles.rowBorder]}>
                <Text style={styles.rowIcon}>{ICON.car}</Text>
                <View style={styles.rowContent}>
                  <Text style={styles.rowLabel}>Aucun v\u00E9hicule enregistr\u00E9</Text>
                  <Text style={styles.rowSub}>Ajoutez votre v\u00E9hicule pour simplifier vos r\u00E9servations</Text>
                </View>
              </View>
            ) : (
              vehicles.map((v, i) => (
                <View key={v.id} style={[styles.row, styles.rowBorder]}>
                  <Text style={styles.rowIcon}>{ICON.car}</Text>
                  <View style={styles.rowContent}>
                    <Text style={styles.rowLabel}>{v.brand} {v.model}</Text>
                    <Text style={styles.rowSub}>{v.color} \u2022 {v.licensePlate}{v.isFavorite ? '  ' + ICON.star : ''}</Text>
                  </View>
                </View>
              ))
            )}
            <TouchableOpacity style={styles.row} onPress={() => setShowAddModal(true)} activeOpacity={0.65}>
              <Text style={styles.rowIcon}>{ICON.add}</Text>
              <View style={styles.rowContent}>
                <Text style={[styles.rowLabel, { color: '#1558f5' }]}>Ajouter un v\u00E9hicule</Text>
              </View>
              <Text style={styles.rowChevron}>{'>'}</Text>
            </TouchableOpacity>
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
                    {row.external ? ICON.arrow : '>'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Modal Ajout Vehicule */}
      <Modal visible={showAddModal} animationType="slide" transparent onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{ICON.car}{'  '}Ajouter un v\u00E9hicule</Text>

            <Text style={styles.modalLabel}>Marque</Text>
            <TextInput style={styles.modalInput} value={brand} onChangeText={setBrand} placeholder="Ex\u00A0: Toyota" placeholderTextColor="#94a3b8" />

            <Text style={styles.modalLabel}>Mod\u00E8le</Text>
            <TextInput style={styles.modalInput} value={model} onChangeText={setModel} placeholder="Ex\u00A0: Corolla" placeholderTextColor="#94a3b8" />

            <Text style={styles.modalLabel}>Couleur</Text>
            <TextInput style={styles.modalInput} value={color} onChangeText={setColor} placeholder="Ex\u00A0: Blanc" placeholderTextColor="#94a3b8" />

            <Text style={styles.modalLabel}>Plaque d'immatriculation</Text>
            <TextInput style={styles.modalInput} value={plate} onChangeText={setPlate} placeholder="Ex\u00A0: AB-1234-CI" placeholderTextColor="#94a3b8" autoCapitalize="characters" />

            <View style={styles.favoriteRow}>
              <Text style={styles.favoriteLabel}>{ICON.star}{'  '}D\u00E9finir comme favori</Text>
              <Switch
                value={isFavorite}
                onValueChange={setIsFavorite}
                trackColor={{ false: '#e2e8f0', true: '#1558f5' }}
                thumbColor="#fff"
              />
            </View>

            <TouchableOpacity
              style={[styles.modalSaveBtn, savingVehicle && { opacity: 0.6 }]}
              onPress={handleAddVehicle}
              disabled={savingVehicle}
              activeOpacity={0.85}
            >
              <Text style={styles.modalSaveBtnText}>{savingVehicle ? 'Enregistrement...' : 'Enregistrer'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowAddModal(false)}>
              <Text style={styles.modalCancelBtnText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
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
  rowIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: 15, fontWeight: '500', color: '#1e293b', letterSpacing: -0.2 },
  rowLabelDanger: { color: '#ef4444', fontWeight: '500' },
  rowSub: { fontSize: 12, color: '#94a3b8', marginTop: 1, fontWeight: '400' },
  rowChevron: { fontSize: 20, color: '#cbd5e1', fontWeight: '300' },
  rowExternal: { fontSize: 16, color: '#94a3b8' },

  guestContainer: { flex: 1, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  guestAvatarRing: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  guestAvatarIcon: { fontSize: 32 },
  guestTitle: { fontSize: 22, fontWeight: '600', color: '#0f172a', marginBottom: 8, letterSpacing: -0.4 },
  guestSub: { fontSize: 14, color: '#94a3b8', textAlign: 'center', lineHeight: 20, marginBottom: 28, fontWeight: '400' },
  guestLoginBtn: { backgroundColor: '#1558f5', borderRadius: 16, paddingVertical: 15, paddingHorizontal: 48, marginBottom: 12, shadowColor: '#1558f5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 },
  guestLoginBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  guestRegisterLink: { fontSize: 14, color: '#1558f5', fontWeight: '500' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 },
  modalHandle: { width: 40, height: 4, backgroundColor: '#e2e8f0', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#0f172a', marginBottom: 4, letterSpacing: -0.4 },
  modalLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 14 },
  modalInput: { borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, color: '#0f172a', backgroundColor: '#f8fafc' },
  favoriteRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, marginBottom: 4 },
  favoriteLabel: { fontSize: 15, fontWeight: '500', color: '#1e293b' },
  modalSaveBtn: { backgroundColor: '#1558f5', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 24, shadowColor: '#1558f5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 },
  modalSaveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  modalCancelBtn: { paddingVertical: 14, alignItems: 'center', marginTop: 6 },
  modalCancelBtnText: { fontSize: 15, color: '#64748b', fontWeight: '500' },
});
