import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

interface AppSettings {
  language: 'en' | 'id';
  theme: 'light' | 'dark' | 'system';
  alarmSound: string;
  alarmVolume: number;
  notificationsEnabled: boolean;
}

interface AppSettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  isDarkMode: boolean;
  playAlarm: () => Promise<void>;
  stopAlarm: () => Promise<void>;
}

const defaultSettings: AppSettings = {
  language: 'en',
  theme: 'system',
  alarmSound: 'default',
  alarmVolume: 0.7,
  notificationsEnabled: true,
};

const defaultAlarms = {
  default: require('../assets/sounds/default-alarm.mp3'),
  bell: require('../assets/sounds/bell.mp3'),
  digital: require('../assets/sounds/digital.mp3'),
  gentle: require('../assets/sounds/gentle.mp3'),
};

let webAudio: HTMLAudioElement | null = null;
let Audio: any = null;
if (Platform.OS !== 'web') {
  Audio = require('expo-av').Audio;
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export const AppSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const systemColorScheme = useColorScheme();
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  // Calculate dark mode based on settings and system preference
  const isDarkMode =
    settings.theme === 'dark' ||
    (settings.theme === 'system' && systemColorScheme === 'dark');

  // Load settings from storage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem('appSettings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };
    loadSettings();
  }, []);

  // Save settings when they change
  useEffect(() => {
    const saveSettings = async () => {
      try {
        await AsyncStorage.setItem('appSettings', JSON.stringify(settings));
      } catch (error) {
        console.error('Failed to save settings:', error);
      }
    };
    saveSettings();
  }, [settings]);

  // Configure notifications
  useEffect(() => {
    if (Platform.OS !== 'web') {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
    }
  }, []);

  const playAlarm = async () => {
    if (Platform.OS === 'web') {
      if (webAudio) {
        webAudio.pause();
        webAudio = null;
      }
      // Map sound name to file path
      const soundMap: Record<string, string> = {
        default: require('../assets/sounds/default-alarm.mp3').default,
        bell: require('../assets/sounds/bell.mp3').default,
        digital: require('../assets/sounds/digital.mp3').default,
        gentle: require('../assets/sounds/gentle.mp3').default,
      };
      const src = soundMap[settings.alarmSound] || soundMap.default;
      webAudio = new Audio(src);
      webAudio.volume = settings.alarmVolume;
      webAudio.loop = true;
      webAudio.play();
      console.log('playAlarm (web): play', src);
      return;
    }
    try {
      if (soundRef.current) {
        console.log('playAlarm: stop & unload previous sound (ref)', soundRef.current);
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      if (Audio) {
        const { sound: newSound } = await Audio.Sound.createAsync(
          defaultAlarms[settings.alarmSound as keyof typeof defaultAlarms],
          {
            shouldPlay: true,
            volume: settings.alarmVolume,
            isLooping: true,
          }
        );
        soundRef.current = newSound;
        setSound(newSound);
        console.log('playAlarm: new sound instance created (ref)', newSound);
        // Show notification on mobile
        if (Platform.OS !== 'web' && settings.notificationsEnabled) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Time is up!',
              body: 'Your timer has finished.',
            },
            trigger: null,
          });
        }
      }
    } catch (error) {
      console.error('Error playing alarm:', error);
    }
  };

  const stopAlarm = async () => {
    console.log('stopAlarm dipanggil, current soundRef:', soundRef.current);
    if (Platform.OS === 'web') {
      if (webAudio) {
        webAudio.pause();
        webAudio.currentTime = 0;
        webAudio = null;
        console.log('stopAlarm (web): webAudio stopped');
      }
      return;
    }
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        console.log('stopAlarm: soundRef stopped & unloaded', soundRef.current);
        soundRef.current = null;
      } else {
        console.log('stopAlarm: no soundRef instance to stop');
      }
    } catch (error) {
      console.error('Error stopping alarm:', error);
    } finally {
      setSound(null);
      console.log('stopAlarm: setSound(null)');
    }
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <AppSettingsContext.Provider
      value={{
        settings,
        updateSettings,
        isDarkMode,
        playAlarm,
        stopAlarm,
      }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
};

export const useAppSettings = () => {
  const context = useContext(AppSettingsContext);
  if (context === undefined) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider');
  }
  return context;
};