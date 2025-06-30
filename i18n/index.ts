import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      'Focus Time': 'Focus Time',
      'Short Break': 'Short Break',
      'Long Break': 'Long Break',
      'Settings': 'Settings',
      'Timer': 'Timer',
      'Stats': 'Stats',
      'Language': 'Language',
      'Theme': 'Theme',
      'System': 'System',
      'Light': 'Light',
      'Dark': 'Dark',
      'Alarm Sound': 'Alarm Sound',
      'Default': 'Default',
      'Bell': 'Bell',
      'Digital': 'Digital',
      'Gentle': 'Gentle',
      'Volume': 'Volume',
      'Notifications': 'Notifications',
      'Enable Notifications': 'Enable Notifications',
      'Session': 'Session',
      'of': 'of',
    },
  },
  id: {
    translation: {
      'Focus Time': 'Waktu Fokus',
      'Short Break': 'Istirahat Pendek',
      'Long Break': 'Istirahat Panjang',
      'Settings': 'Pengaturan',
      'Timer': 'Pengatur Waktu',
      'Stats': 'Statistik',
      'Language': 'Bahasa',
      'Theme': 'Tema',
      'System': 'Sistem',
      'Light': 'Terang',
      'Dark': 'Gelap',
      'Alarm Sound': 'Suara Alarm',
      'Default': 'Default',
      'Bell': 'Lonceng',
      'Digital': 'Digital',
      'Gentle': 'Lembut',
      'Volume': 'Volume',
      'Notifications': 'Notifikasi',
      'Enable Notifications': 'Aktifkan Notifikasi',
      'Session': 'Sesi',
      'of': 'dari',
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;