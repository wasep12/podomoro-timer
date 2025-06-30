# Podomoro Time (expo-nativewind)

Aplikasi Pomodoro Timer modern berbasis React Native + Expo, mendukung multi-platform (Android, iOS, Web), dengan fitur statistik, pengaturan personalisasi, dan notifikasi.

---

## ✨ Fitur Utama

- **Pomodoro Timer**: Atur waktu fokus, istirahat pendek, dan istirahat panjang sesuai kebutuhan.
- **Statistik Produktivitas**: Lihat statistik sesi fokus, break, total waktu fokus, dan skor produktivitas.
- **Pengaturan Lengkap**:
  - Durasi fokus, short break, long break, jumlah sesi sebelum long break
  - Pilihan suara alarm & volume
  - Tema (terang, gelap, sistem)
  - Bahasa (Indonesia & English)
  - Notifikasi (enable/disable)
- **Multi-Platform**: Dukungan penuh Android, iOS, dan Web.
- **Auto Start**: Opsi auto-start untuk break dan pomodoro berikutnya.
- **Keep Awake**: Layar tetap menyala saat timer berjalan (native).
- **Internationalization (i18n)**: Mendukung multi-bahasa.

---

## 🗂️ Struktur Folder

```
project/
├── app/                # Entry point & routing (expo-router)
│   ├── _layout.tsx     # Root layout, context provider
│   └── (tabs)/         # Tab screens: Timer, Statistics, Settings
│       ├── index.tsx   # Timer utama
│       ├── statistics.tsx # Statistik
│       └── settings.tsx   # Pengaturan
├── components/         # Komponen UI reusable
│   └── Timer/          # Komponen timer (display, controls, progress)
├── context/            # Context global (Pomodoro, AppSettings)
├── hooks/              # Custom hooks
├── utils/              # Utility functions
├── assets/             # Gambar & suara
├── i18n/               # Konfigurasi multi-bahasa
├── app.json            # Konfigurasi Expo
├── eas.json            # Konfigurasi EAS Build
└── package.json        # Dependency & scripts
```

---

## ⚙️ Penjelasan Kode & Arsitektur

### Context

- **PomodoroContext** (`context/PomodoroContext.tsx`):
  - Menyimpan state timer, fase (focus/shortBreak/longBreak), statistik, dan logic utama Pomodoro.
  - Fungsi: startTimer, pauseTimer, resetTimer, skipToNext, updateSettings.
- **AppSettingsContext** (`context/AppSettingsContext.tsx`):
  - Menyimpan preferensi user (tema, bahasa, suara alarm, volume, notifikasi).
  - Fungsi: updateSettings, playAlarm, stopAlarm, isDarkMode.

### Komponen Utama

- **TimerDisplay**: Menampilkan waktu, progress, dan sesi.
- **TimerControls**: Kontrol play/pause, reset, skip.
- **CircularProgress**: Progress bar timer.
- **SettingsScreen**: Pengaturan durasi, tema, bahasa, suara, notifikasi.
- **StatisticsScreen**: Statistik sesi dan produktivitas.

### Hooks

- **useFrameworkReady**: Untuk web, menandai framework siap.
- **usePomodoro**: Akses context Pomodoro.
- **useAppSettings**: Akses context AppSettings.

### Internationalization (i18n)

- File: `i18n/index.ts`
- Mendukung English & Indonesia.

---

## 🚀 Cara Build & Menjalankan

### 1. Install Dependency

```sh
npm install
```

### 2. Jalankan di Development

```sh
npx expo start
```

### 3. Build APK/AAB di Cloud (EAS Build)

```sh
npx eas build -p android
```

### 4. Build iOS (hanya di macOS/cloud)

```sh
npx eas build -p ios
```

---

## 📦 Dependency Utama

- expo, react-native, expo-router, expo-notifications, expo-av, expo-font, react-i18next, @react-native-async-storage/async-storage, dan lainnya (lihat `package.json`)

---

## 📝 Lisensi

MIT

---

## 🙏 Kontribusi

Pull request & issue sangat diterima!
