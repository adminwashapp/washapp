import {
  View, Text, StyleSheet, TouchableOpacity,
  ImageBackground, StatusBar, Platform, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useLang } from '../../contexts/lang';
import { LangToggle } from '../../components/LangToggle';

const BG   = require('../../assets/images/manphone.png');
const LOGO = require('../../assets/images/logowashapp.png');

export default function WelcomeScreen() {
  const router = useRouter();
  const { t } = useLang();

  const badges = [
    t('welcome_badge1'), t('welcome_badge2'),
    t('welcome_badge3'), t('welcome_badge4'),
  ];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
        <LinearGradient
          colors={['rgba(4,12,36,0.97)', 'rgba(4,12,36,0.90)', 'rgba(4,12,36,0.70)', 'rgba(4,12,36,0.50)']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.content}>

          {/* Logo + toggle */}
          <View style={styles.topRow}>
            <View style={styles.logoRow}>
              <Image source={LOGO} style={styles.logoImg} resizeMode="contain" />
              <Text style={styles.logoText}>Washapp</Text>
            </View>
            <LangToggle />
          </View>

          {/* Hero */}
          <View style={styles.heroBlock}>
            <Text style={styles.overline}>{t('welcome_overline')}</Text>
            <Text style={styles.title}>
              {t('welcome_title')}{'\n'}
              <Text style={styles.titleAccent}>{t('welcome_accent')}</Text>
            </Text>
            <Text style={styles.subtitle}>{t('welcome_subtitle')}</Text>
            <View style={styles.badges}>
              {badges.map((b) => (
                <View key={b} style={styles.badge}>
                  <Text style={styles.badgeCheck}>{'✓'}</Text>
                  <Text style={styles.badgeText}>{b}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* CTA */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.btnPrimary} activeOpacity={0.85} onPress={() => router.push('/(auth)/register')}>
              <LinearGradient colors={['#2f78ff', '#1558f5', '#1045e1']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.btnGradient}>
                <Text style={styles.btnPrimaryText}>{t('welcome_cta')}</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnSecondary} activeOpacity={0.85} onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.btnSecondaryText}>{t('welcome_login')}</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#040c24' },
  bg: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 26, paddingTop: Platform.OS === 'ios' ? 60 : 48, paddingBottom: 36, justifyContent: 'space-between' },

  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: -4 },
  logoImg: { width: 48, height: 48 },
  logoText: { fontSize: 24, fontWeight: '700', color: '#fff', letterSpacing: -0.5 },

  heroBlock: { flex: 1, justifyContent: 'center', paddingBottom: 40 },
  overline: { fontSize: 10, fontWeight: '700', letterSpacing: 3, color: '#5999ff', marginBottom: 16, textTransform: 'uppercase' },
  title: { fontSize: 38, fontWeight: '700', color: '#fff', lineHeight: 46, letterSpacing: -0.8, marginBottom: 16 },
  titleAccent: { color: '#5999ff' },
  subtitle: { fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 24, marginBottom: 28, fontWeight: '400' },

  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12 },
  badgeCheck: { fontSize: 11, color: '#5999ff', fontWeight: '700' },
  badgeText: { fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },

  actions: { gap: 12 },
  btnPrimary: { borderRadius: 16, overflow: 'hidden', shadowColor: '#1558f5', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 16, elevation: 10 },
  btnGradient: { paddingVertical: 17, alignItems: 'center', borderRadius: 16 },
  btnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 16, letterSpacing: 0.2 },
  btnSecondary: { borderWidth: 2, borderColor: 'rgba(255,255,255,0.28)', borderRadius: 16, paddingVertical: 15, alignItems: 'center' },
  btnSecondaryText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});