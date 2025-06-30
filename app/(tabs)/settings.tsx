import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Platform,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePomodoro } from '@/context/PomodoroContext';
import { useAppSettings } from '@/context/AppSettingsContext';
import { Minus, Plus, Moon, Sun, Monitor, Volume2, VolumeX } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Slider from '@/components/PlatformSlider';

export default function SettingsScreen() {
  const { settings: pomodoroSettings, updateSettings: updatePomodoroSettings } = usePomodoro();
  const { settings: appSettings, updateSettings: updateAppSettings, isDarkMode, playAlarm, stopAlarm, sound } = useAppSettings();
  const { t, i18n } = useTranslation();

  // Local state for settings sliders
  const [focusDuration, setFocusDuration] = useState(pomodoroSettings.focusDuration);
  const [shortBreakDuration, setShortBreakDuration] = useState(pomodoroSettings.shortBreakDuration);
  const [longBreakDuration, setLongBreakDuration] = useState(pomodoroSettings.longBreakDuration);
  const [sessionsBeforeLongBreak, setSessionsBeforeLongBreak] = useState(
    pomodoroSettings.sessionsBeforeLongBreak
  );

  const containerStyle = [
    styles.container,
    isDarkMode && styles.containerDark
  ];

  const textStyle = [
    styles.text,
    isDarkMode && styles.textDark
  ];

  // Apply settings changes
  const applySettings = () => {
    updatePomodoroSettings({
      focusDuration,
      shortBreakDuration,
      longBreakDuration,
      sessionsBeforeLongBreak,
    });
  };

  // Handle updates with validation
  const handleNumberChange = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    value: number,
    min: number,
    max: number
  ) => {
    if (value >= min && value <= max) {
      setter(value);
      // Auto-apply settings
      setTimeout(() => applySettings(), 100);
    }
  };

  const themeOptions = [
    { value: 'system', icon: Monitor },
    { value: 'light', icon: Sun },
    { value: 'dark', icon: Moon },
  ];

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'id', label: 'Indonesia' },
  ];

  const alarmSounds = [
    { value: 'default', label: t('Default') },
    { value: 'bell', label: t('Bell') },
    { value: 'digital', label: t('Digital') },
    { value: 'gentle', label: t('Gentle') },
  ];

  // Pastikan icon langsung update setelah stopAlarm
  useEffect(() => { }, [sound]);

  // Update volume secara realtime saat slider diubah dan sound sedang aktif
  useEffect(() => {
    if (sound && sound.setVolumeAsync) {
      sound.setVolumeAsync(appSettings.alarmVolume);
    }
  }, [appSettings.alarmVolume, sound]);

  return (
    <SafeAreaView style={containerStyle}>
      <View style={[styles.header, isDarkMode && styles.headerDark]}>
        <Text style={[styles.title, isDarkMode && styles.titleDark]}>{t('Settings')}</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>{t('Language')}</Text>
          <View style={styles.languageContainer}>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageButton,
                  appSettings.language === lang.code && styles.languageButtonActive,
                  isDarkMode && styles.languageButtonDark,
                ]}
                onPress={() => {
                  updateAppSettings({ language: lang.code as 'en' | 'id' });
                  i18n.changeLanguage(lang.code);
                }}
              >
                <Text style={[
                  styles.languageButtonText,
                  appSettings.language === lang.code && styles.languageButtonTextActive,
                  isDarkMode && styles.languageButtonTextDark,
                ]}>
                  {lang.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>{t('Theme')}</Text>
          <View style={styles.themeContainer}>
            {themeOptions.map(({ value, icon: Icon }) => (
              <TouchableOpacity
                key={value}
                style={[
                  styles.themeButton,
                  appSettings.theme === value && styles.themeButtonActive,
                  isDarkMode && styles.themeButtonDark,
                ]}
                onPress={() => updateAppSettings({ theme: value as 'system' | 'light' | 'dark' })}
              >
                <Icon
                  size={24}
                  color={appSettings.theme === value ? '#fff' : (isDarkMode ? '#fff' : '#1e293b')}
                />
                <Text style={[
                  styles.themeButtonText,
                  appSettings.theme === value && styles.themeButtonTextActive,
                  isDarkMode && styles.themeButtonTextDark,
                ]}>
                  {t(value.charAt(0).toUpperCase() + value.slice(1))}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>{t('Timer')}</Text>

          <View style={[styles.settingItem, isDarkMode && styles.settingItemDark]}>
            <Text style={[styles.settingLabel, isDarkMode && styles.settingLabelDark]}>{t('Focus Time')}</Text>
            <View style={styles.settingControl}>
              <TouchableOpacity
                style={[styles.button, isDarkMode && styles.buttonDark]}
                onPress={() => handleNumberChange(setFocusDuration, focusDuration - 1, 1, 60)}
              >
                <Minus size={16} color={isDarkMode ? '#fff' : '#6366f1'} />
              </TouchableOpacity>

              <Text style={[styles.valueText, isDarkMode && styles.valueTextDark]}>{focusDuration} min</Text>

              <TouchableOpacity
                style={[styles.button, isDarkMode && styles.buttonDark]}
                onPress={() => handleNumberChange(setFocusDuration, focusDuration + 1, 1, 60)}
              >
                <Plus size={16} color={isDarkMode ? '#fff' : '#6366f1'} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.settingItem, isDarkMode && styles.settingItemDark]}>
            <Text style={[styles.settingLabel, isDarkMode && styles.settingLabelDark]}>{t('Short Break')}</Text>
            <View style={styles.settingControl}>
              <TouchableOpacity
                style={[styles.button, isDarkMode && styles.buttonDark]}
                onPress={() => handleNumberChange(setShortBreakDuration, shortBreakDuration - 1, 1, 30)}
              >
                <Minus size={16} color={isDarkMode ? '#fff' : '#10b981'} />
              </TouchableOpacity>

              <Text style={[styles.valueText, isDarkMode && styles.valueTextDark]}>{shortBreakDuration} min</Text>

              <TouchableOpacity
                style={[styles.button, isDarkMode && styles.buttonDark]}
                onPress={() => handleNumberChange(setShortBreakDuration, shortBreakDuration + 1, 1, 30)}
              >
                <Plus size={16} color={isDarkMode ? '#fff' : '#10b981'} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.settingItem, isDarkMode && styles.settingItemDark]}>
            <Text style={[styles.settingLabel, isDarkMode && styles.settingLabelDark]}>{t('Long Break')}</Text>
            <View style={styles.settingControl}>
              <TouchableOpacity
                style={[styles.button, isDarkMode && styles.buttonDark]}
                onPress={() => handleNumberChange(setLongBreakDuration, longBreakDuration - 1, 1, 60)}
              >
                <Minus size={16} color={isDarkMode ? '#fff' : '#0ea5e9'} />
              </TouchableOpacity>

              <Text style={[styles.valueText, isDarkMode && styles.valueTextDark]}>{longBreakDuration} min</Text>

              <TouchableOpacity
                style={[styles.button, isDarkMode && styles.buttonDark]}
                onPress={() => handleNumberChange(setLongBreakDuration, longBreakDuration + 1, 1, 60)}
              >
                <Plus size={16} color={isDarkMode ? '#fff' : '#0ea5e9'} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.settingItem, isDarkMode && styles.settingItemDark]}>
            <Text style={[styles.settingLabel, isDarkMode && styles.settingLabelDark]}>{t('Sessions Before Long Break')}</Text>
            <View style={styles.settingControl}>
              <TouchableOpacity
                style={[styles.button, isDarkMode && styles.buttonDark]}
                onPress={() => handleNumberChange(setSessionsBeforeLongBreak, sessionsBeforeLongBreak - 1, 1, 10)}
              >
                <Minus size={16} color={isDarkMode ? '#fff' : '#6366f1'} />
              </TouchableOpacity>

              <Text style={[styles.valueText, isDarkMode && styles.valueTextDark]}>{sessionsBeforeLongBreak}</Text>

              <TouchableOpacity
                style={[styles.button, isDarkMode && styles.buttonDark]}
                onPress={() => handleNumberChange(setSessionsBeforeLongBreak, sessionsBeforeLongBreak + 1, 1, 10)}
              >
                <Plus size={16} color={isDarkMode ? '#fff' : '#6366f1'} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>{t('Alarm Sound')}</Text>
          <View style={styles.alarmContainer}>
            {alarmSounds.map((sound) => (
              <TouchableOpacity
                key={sound.value}
                style={[
                  styles.alarmButton,
                  appSettings.alarmSound === sound.value && styles.alarmButtonActive,
                  isDarkMode && styles.alarmButtonDark,
                ]}
                onPress={() => {
                  updateAppSettings({ alarmSound: sound.value });
                  if (sound) stopAlarm();
                }}
              >
                <Text style={[
                  styles.alarmButtonText,
                  appSettings.alarmSound === sound.value && styles.alarmButtonTextActive,
                  isDarkMode && styles.alarmButtonTextDark,
                ]}>
                  {sound.label}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.alarmButton, styles.testButton, isDarkMode && styles.alarmButtonDark]}
              onPress={async () => {
                if (sound) {
                  await stopAlarm();
                } else {
                  await playAlarm();
                }
              }}
              accessibilityLabel={sound ? t('Stop Sound') : t('Test Sound')}
            >
              {sound ? (
                <VolumeX size={20} color="#ef4444" />
              ) : (
                <Volume2 size={20} color={isDarkMode ? '#fff' : '#6366f1'} />
              )}
            </TouchableOpacity>
          </View>

          <View style={[styles.settingItem, isDarkMode && styles.settingItemDark]}>
            <Text style={[styles.settingLabel, isDarkMode && styles.settingLabelDark]}>{t('Volume')}</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              value={appSettings.alarmVolume}
              onValueChange={(value) => updateAppSettings({ alarmVolume: value })}
              minimumTrackTintColor={isDarkMode ? '#6366f1' : '#4f46e5'}
              maximumTrackTintColor={isDarkMode ? '#4b5563' : '#d1d5db'}
              thumbTintColor={isDarkMode ? '#6366f1' : '#4f46e5'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>{t('Notifications')}</Text>
          <View style={[styles.settingItem, isDarkMode && styles.settingItemDark]}>
            <Text style={[styles.settingLabel, isDarkMode && styles.settingLabelDark]}>
              {t('Enable Notifications')}
            </Text>
            <Switch
              value={appSettings.notificationsEnabled}
              onValueChange={(value) => updateAppSettings({ notificationsEnabled: value })}
              trackColor={{ false: '#d1d5db', true: '#a5b4fc' }}
              thumbColor={appSettings.notificationsEnabled ? '#6366f1' : '#f3f4f6'}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  containerDark: {
    backgroundColor: '#1a1a1a',
  },
  header: {
    paddingTop: 16,
    paddingHorizontal: 24,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 16,
  },
  headerDark: {
    borderBottomColor: '#2d2d2d',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins-SemiBold',
    color: '#1e293b',
  },
  titleDark: {
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#475569',
    marginBottom: 16,
  },
  sectionTitleDark: {
    color: '#94a3b8',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingItemDark: {
    borderBottomColor: '#2d2d2d',
  },
  settingLabel: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#334155',
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  settingLabelDark: {
    color: '#e2e8f0',
  },
  settingControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDark: {
    backgroundColor: '#2d2d2d',
  },
  valueText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#334155',
    marginHorizontal: 12,
    minWidth: 60,
    textAlign: 'center',
  },
  valueTextDark: {
    color: '#e2e8f0',
  },
  languageContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  languageButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  languageButtonDark: {
    backgroundColor: '#2d2d2d',
  },
  languageButtonActive: {
    backgroundColor: '#6366f1',
  },
  languageButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#334155',
  },
  languageButtonTextDark: {
    color: '#e2e8f0',
  },
  languageButtonTextActive: {
    color: '#ffffff',
  },
  themeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  themeButton: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  themeButtonDark: {
    backgroundColor: '#2d2d2d',
  },
  themeButtonActive: {
    backgroundColor: '#6366f1',
  },
  themeButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#334155',
  },
  themeButtonTextDark: {
    color: '#e2e8f0',
  },
  themeButtonTextActive: {
    color: '#ffffff',
  },
  alarmContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  alarmButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  alarmButtonDark: {
    backgroundColor: '#2d2d2d',
  },
  alarmButtonActive: {
    backgroundColor: '#6366f1',
  },
  alarmButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#334155',
  },
  alarmButtonTextDark: {
    color: '#e2e8f0',
  },
  alarmButtonTextActive: {
    color: '#ffffff',
  },
  slider: {
    width: 200,
    height: 40,
  },
  testButton: {
    marginLeft: 8,
    backgroundColor: '#e0e7ff',
  },
});