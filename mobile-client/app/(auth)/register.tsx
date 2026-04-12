import { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { authApi } from '../../services/api';
import { useAuthStore } from '../../store';

const LOGO = require('../../assets/images/logowashapp.png');

export default function RegisterScreen() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !phone || !password || !confirm) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit faire au moins 6 caracteres');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.registerClient({ name, phone, password });
      await setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
      router.replace('/(tabs)/map');
    } catch (e: any) {
      Alert.alert('Erreur', e.response?.data?.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={styles.logoRow}>
            <Image source={LOGO} style={styles.logoImg} resizeMode="contain" />
            <Text style={styles.logoText}>Washapp</Text>
          </View>
          <Text style={styles.title}>Creer un compte</Text>
          <Text style={styles.subtitle}>Rejoignez Washapp et commandez votre premier lavage</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Nom complet</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Jean Kouassi"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Telephone</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="07 00 00 00 00"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Mot de passe</Text>
            <View style={styles.pwdRow}>
              <TextInput
                style={[styles.input, { flex: 1, borderWidth: 0, padding: 0, backgroundColor: 'transparent' }]}
                value={password}
                onChangeText={setPassword}
                placeholder="Minimum 6 caracteres"
                secureTextEntry={!showPwd}
              />
              <TouchableOpacity onPress={() => setShowPwd(!showPwd)}>
                <Text style={styles.eyeText}>{showPwd ? '🙈' : '👁'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Confirmer le mot de passe</Text>
            <TextInput
              style={styles.input}
              value={confirm}
              onChangeText={setConfirm}
              placeholder="Repetez le mot de passe"
              secureTextEntry={!showPwd}
            />
          </View>

          <TouchableOpacity
            style={[styles.btnWrap, loading && { opacity: 0.6 }]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#2f78ff', '#1558f5', '#1045e1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.btn}
            >
              <Text style={styles.btnText}>
                {loading ? 'Inscription...' : "Creer mon compte"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.link}>
            <Text style={styles.linkText}>
              Deja un compte ?{' '}
              <Text style={styles.linkBold}>Se connecter</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 56, paddingBottom: 40 },

  header: { alignItems: 'center', marginBottom: 36 },
  backBtn: {
    position: 'absolute', left: 0, top: 0,
    width: 40, height: 40, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#f1f5f9', borderRadius: 12,
  },
  backArrow: { fontSize: 20, color: '#0f172a' },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  logoImg: { width: 48, height: 48 },
  logoText: { fontSize: 24, fontWeight: '700', color: '#0f172a', letterSpacing: -0.5 },
  title: { fontSize: 26, fontWeight: '800', color: '#0f172a', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 20 },

  form: { gap: 16 },
  field: { gap: 7 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151' },
  input: {
    borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 16,
    color: '#0f172a', backgroundColor: '#fff',
  },
  pwdRow: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1.5,
    borderColor: '#e2e8f0', borderRadius: 14, paddingHorizontal: 16,
    paddingVertical: 14, backgroundColor: '#fff',
  },
  eyeText: { fontSize: 18 },

  btnWrap: { borderRadius: 16, overflow: 'hidden', marginTop: 8,
    shadowColor: '#1558f5', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 10,
  },
  btn: { paddingVertical: 17, alignItems: 'center', borderRadius: 16 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16 },

  link: { alignItems: 'center', marginTop: 4 },
  linkText: { fontSize: 14, color: '#64748b' },
  linkBold: { color: '#1558f5', fontWeight: '700' },
});