import { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { authApi } from '../../services/api';
import { useAuthStore } from '../../store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLang } from '../../contexts/lang';
import { registerForPushNotifications } from '../../services/notifications';
import { LangToggle } from '../../components/LangToggle';

const LOGO = require('../../assets/images/logowashapp.png');

export default function LoginScreen() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useLang();

  const handleLogin = async () => {
    if (!phone || !password) { Alert.alert('Erreur', 'Remplissez tous les champs'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await authApi.loginClient({ phone, password });
      await setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
      registerForPushNotifications(authApi.savePushToken).catch(() => {});
      router.replace('/(tabs)/map');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Identifiants invalides');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    const demoUser = { id: 'demo-001', name: 'Lohrans Demo', phone: '07 00 00 00 00', email: 'demo@washapp.ci', role: 'CLIENT' as const };
    await setAuth(demoUser, 'demo-token', 'demo-refresh');
    router.replace('/(tabs)/map');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>Ã¢â€ Â</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <View style={styles.logoRow}>
              <Image source={LOGO} style={styles.logoImg} resizeMode="contain" />
              <Text style={styles.logoText}>Washapp</Text>
            </View>
            <LangToggle dark />
          </View>
          <Text style={styles.title}>{t('login_title')}</Text>
          <Text style={styles.subtitle}>{t('login_subtitle')}</Text>
        </View>

        <View style={styles.form}>
          {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

          <View style={styles.field}>
            <Text style={styles.label}>Telephone</Text>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="07 00 00 00 00" keyboardType="phone-pad" />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Mot de passe</Text>
            <View style={styles.pwdRow}>
              <TextInput style={[styles.input, { flex: 1, borderWidth: 0, padding: 0, backgroundColor: 'transparent' }]} value={password} onChangeText={setPassword} placeholder="Votre mot de passe" secureTextEntry={!showPwd} />
              <TouchableOpacity onPress={() => setShowPwd(!showPwd)}>
                <Text style={{ fontSize: 18 }}>{showPwd ? 'Ã°Å¸â„¢Ë†' : 'Ã°Å¸â€˜Â'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password' as any)}
            style={{ alignSelf: 'flex-end', marginTop: -4, marginBottom: 8 }} activeOpacity={0.8}>
            <Text style={{ fontSize: 13, color: '#1558f5', fontWeight: '600' }}>Mot de passe oubliÃƒÂ© ?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btnWrap, loading && { opacity: 0.6 }]} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
            <LinearGradient colors={['#2f78ff', '#1558f5', '#1045e1']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.btn}>
              <Text style={styles.btnText}>{loading ? t('login_submitting') : t('login_submit')}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.demoBtn} onPress={handleDemo} activeOpacity={0.8}>
            <Text style={styles.demoBtnText}>Connexion demo (sans backend)</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={styles.link}>
            <Text style={styles.linkText}>Pas de compte ? <Text style={styles.linkBold}>Creer un compte</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 44, paddingBottom: 24 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9', borderRadius: 12, marginBottom: 20 },
  backArrow: { fontSize: 20, color: '#0f172a' },
  header: { alignItems: 'center', marginBottom: 36 },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 16 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  logoImg: { width: 48, height: 48 },
  logoText: { fontSize: 24, fontWeight: '700', color: '#0f172a', letterSpacing: -0.5 },
  title: { fontSize: 26, fontWeight: '800', color: '#0f172a', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#64748b', textAlign: 'center' },
  form: { gap: 16 },
  field: { gap: 7 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151' },
  input: { borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#0f172a', backgroundColor: '#fff' },
  pwdRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff' },
  errorBox: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', borderRadius: 12, padding: 12 },
  errorText: { color: '#dc2626', fontSize: 13, fontWeight: '500' },
  btnWrap: { borderRadius: 16, overflow: 'hidden', marginTop: 8, shadowColor: '#1558f5', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10 },
  btn: { paddingVertical: 17, alignItems: 'center', borderRadius: 16 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  demoBtn: { borderWidth: 1.5, borderColor: '#cbd5e1', borderRadius: 14, paddingVertical: 14, alignItems: 'center', backgroundColor: '#f8fafc' },
  demoBtnText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  link: { alignItems: 'center', marginTop: 8 },
  linkText: { fontSize: 14, color: '#64748b' },
  linkBold: { color: '#1558f5', fontWeight: '700' },
});
