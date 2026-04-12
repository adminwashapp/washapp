import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useLang } from '../contexts/lang';

interface Props {
  dark?: boolean;
}

export function LangToggle({ dark = false }: Props) {
  const { lang, setLang } = useLang();
  return (
    <TouchableOpacity
      style={[styles.btn, dark && styles.btnDark]}
      onPress={() => setLang(lang === 'fr' ? 'en' : 'fr')}
      activeOpacity={0.75}
    >
      <Text style={[styles.inactive, !dark && styles.inactiveLight, lang === 'fr' && styles.active]}>FR</Text>
      <Text style={[styles.sep, dark ? styles.sepDark : styles.sepLight]}>|</Text>
      <Text style={[styles.inactive, !dark && styles.inactiveLight, lang === 'en' && styles.active]}>EN</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
  },
  btnDark: {
    backgroundColor: '#f1f5f9',
    borderColor: '#e2e8f0',
  },
  inactive: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.45)' },
  inactiveLight: { color: '#94a3b8' },
  active: { color: '#fff' },
  sep: { fontSize: 11, fontWeight: '300' },
  sepLight: { color: 'rgba(255,255,255,0.3)' },
  sepDark: { color: '#cbd5e1' },
});