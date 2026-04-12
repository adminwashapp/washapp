import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Lang = 'fr' | 'en';

const translations = {
  fr: {
    // Washer Welcome
    welcome_overline: 'PLATEFORME WASHER',
    welcome_title: 'Votre voiture propre,',
    welcome_accent: 'sans vous deplacer.',
    welcome_subtitle: "Reservez un washer en quelques secondes et faites laver votre vehicule directement a l'endroit qui vous convient. Simple, rapide et pratique.",
    welcome_badge1: 'Reservation rapide',
    welcome_badge2: 'A domicile',
    welcome_badge3: 'Washers verifies',
    welcome_badge4: 'Paiement securise',
    welcome_cta: 'Commencer une mission',
    welcome_login: 'Se connecter',
    // Login
    login_title: 'Connexion',
    login_subtitle: 'Connectez-vous a votre compte Washapp',
    login_phone: 'Telephone',
    login_password: 'Mot de passe',
    login_submit: 'Se connecter',
    login_submitting: 'Connexion...',
    login_demo: 'Connexion demo (sans backend)',
    login_no_account: "Pas de compte ? ",
    login_register: 'Creer un compte',
    // Register
    register_title: 'Creer un compte',
    register_subtitle: 'Rejoignez Washapp et commandez votre premier lavage',
    register_name: 'Prenom et nom',
    register_phone: 'Telephone',
    register_email: 'Email (optionnel)',
    register_password: 'Mot de passe',
    register_confirm: 'Confirmer le mot de passe',
    register_submit: "S'inscrire",
    register_submitting: 'Inscription...',
    register_has_account: 'Deja un compte ? ',
    register_login: 'Se connecter',
    register_accept: "En creant un compte, j'accepte les",
    register_cgu: 'CGU',
    register_and: 'et la',
    register_privacy: 'politique de confidentialite',
    // Map
    map_greeting_hello: 'Bonjour',
    map_greeting_sub: 'Ou lavons-nous votre vehicule ?',
    map_find: 'Trouver un washer',
    map_sheet_title: 'Choisissez votre prestation',
    map_exterior: 'Exterieur',
    map_interior: 'Interieur',
    map_full: 'Complet',
    map_instant: 'Instantane',
    map_book: 'Reserver',
    // Menu
    menu_home: 'Accueil',
    menu_reservations: 'Mes reservations',
    menu_account: 'Mon compte',
    menu_faq: 'FAQ',
    menu_legal: 'Mentions legales',
    menu_logout: 'Deconnexion',
    // Account
    account_title: 'Mon compte',
    account_edit_name: 'Modifier le nom',
    account_edit_email: "Modifier l'email",
    account_edit_phone: 'Modifier le telephone',
    account_reservations: 'Mes reservations',
    account_history: 'Historique des lavages',
    account_faq: 'FAQ',
    account_support: 'Support / Contact',
    account_legal: 'Mentions legales',
    account_privacy: 'Politique de confidentialite',
    account_logout: 'Deconnexion',
    account_section_info: 'Informations',
    account_section_activity: 'Activite',
    account_section_help: 'Aide',
    account_section_session: 'Session',
    account_guest_title: 'Mon compte',
    account_guest_sub: "Connectez-vous pour acceder\na votre espace personnel",
    account_guest_login: 'Se connecter',
    account_guest_register: 'Creer un compte',
    soon: 'Bientot disponible',
    logout_confirm: 'Voulez-vous vraiment vous deconnecter ?',
    logout_cancel: 'Annuler',
    logout_confirm_btn: 'Deconnecter',
  },
  en: {
    // Washer Welcome
    welcome_overline: 'WASHER PLATFORM',
    welcome_title: 'Your car clean,',
    welcome_accent: 'without moving.',
    welcome_subtitle: 'Book a washer in seconds and have your vehicle cleaned right where you are. Simple, fast and convenient.',
    welcome_badge1: 'Fast booking',
    welcome_badge2: 'At your location',
    welcome_badge3: 'Verified washers',
    welcome_badge4: 'Secure payment',
    welcome_cta: 'Start a mission',
    welcome_login: 'Sign in',
    // Login
    login_title: 'Sign in',
    login_subtitle: 'Sign in to your Washapp account',
    login_phone: 'Phone number',
    login_password: 'Password',
    login_submit: 'Sign in',
    login_submitting: 'Signing in...',
    login_demo: 'Demo login (no backend)',
    login_no_account: 'No account? ',
    login_register: 'Create account',
    // Register
    register_title: 'Create account',
    register_subtitle: 'Join Washapp and book your first wash',
    register_name: 'First and last name',
    register_phone: 'Phone number',
    register_email: 'Email (optional)',
    register_password: 'Password',
    register_confirm: 'Confirm password',
    register_submit: 'Sign up',
    register_submitting: 'Signing up...',
    register_has_account: 'Already have an account? ',
    register_login: 'Sign in',
    register_accept: 'By creating an account, I accept the',
    register_cgu: 'Terms',
    register_and: 'and the',
    register_privacy: 'privacy policy',
    // Map
    map_greeting_hello: 'Hello',
    map_greeting_sub: 'Where shall we wash your car?',
    map_find: 'Find a washer',
    map_sheet_title: 'Choose your service',
    map_exterior: 'Exterior',
    map_interior: 'Interior',
    map_full: 'Full',
    map_instant: 'Instant',
    map_book: 'Schedule',
    // Menu
    menu_home: 'Home',
    menu_reservations: 'My bookings',
    menu_account: 'My account',
    menu_faq: 'FAQ',
    menu_legal: 'Legal notice',
    menu_logout: 'Sign out',
    // Account
    account_title: 'My account',
    account_edit_name: 'Edit name',
    account_edit_email: 'Edit email',
    account_edit_phone: 'Edit phone number',
    account_reservations: 'My bookings',
    account_history: 'Wash history',
    account_faq: 'FAQ',
    account_support: 'Support / Contact',
    account_legal: 'Legal notice',
    account_privacy: 'Privacy policy',
    account_logout: 'Sign out',
    account_section_info: 'Information',
    account_section_activity: 'Activity',
    account_section_help: 'Help',
    account_section_session: 'Session',
    account_guest_title: 'My account',
    account_guest_sub: 'Sign in to access\nyour personal space',
    account_guest_login: 'Sign in',
    account_guest_register: 'Create account',
    soon: 'Coming soon',
    logout_confirm: 'Are you sure you want to sign out?',
    logout_cancel: 'Cancel',
    logout_confirm_btn: 'Sign out',
  },
} as const;

type TranslationKeys = keyof typeof translations.fr;
type Translations = typeof translations;

interface LangContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKeys) => string;
}

const LangContext = createContext<LangContextType>({
  lang: 'fr',
  setLang: () => {},
  t: (key) => key,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('fr');

  useEffect(() => {
    AsyncStorage.getItem('washapp_lang').then((v) => {
      if (v === 'fr' || v === 'en') setLangState(v);
    });
  }, []);

  const setLang = async (l: Lang) => {
    setLangState(l);
    await AsyncStorage.setItem('washapp_lang', l);
  };

  const t = (key: TranslationKeys): string =>
    (translations[lang] as Translations[Lang])[key] ?? key;

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);