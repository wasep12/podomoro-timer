import React, { useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, Platform, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePomodoro } from '@/context/PomodoroContext';
import TimerDisplay from '@/components/Timer/TimerDisplay';
import TimerControls from '@/components/Timer/TimerControls';
import { useKeepAwake } from 'expo-keep-awake';
import { useAppSettings } from '@/context/AppSettingsContext';
import { VolumeX } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';

export default function TimerScreen() {
  // Keep screen awake during active pomodoro sessions only on native platforms
  if (Platform.OS !== 'web') {
    useKeepAwake();
  }

  const { width: screenWidth } = Dimensions.get('window');
  const isSmallScreen = screenWidth < 375;

  const {
    timeRemaining,
    progress,
    currentPhase,
    isRunning,
    isPaused,
    sessionCount,
    startTimer,
    pauseTimer,
    resetTimer,
    skipToNext,
    settings,
    isAlarmActive,
    handleAcknowledgeAlarm,
  } = usePomodoro();
  const { isDarkMode, stopAlarm } = useAppSettings();
  const { t } = useTranslation();

  // Show toast when alarm is active
  useEffect(() => {
    if (isAlarmActive) {
      Toast.show({
        type: 'error',
        position: 'top',
        autoHide: false,
        text1: t('Alarm Sound'),
        text2: t('Timer finished! Please stop the alarm to continue.'),
        topOffset: 60,
        props: {
          onStop: handleAcknowledgeAlarm,
          isDarkMode,
          t,
        },
      });
    } else {
      Toast.hide();
    }
  }, [isAlarmActive, isDarkMode, t]);

  // Set background color based on current phase
  const getBackgroundStyle = () => {
    if (isDarkMode) {
      return { backgroundColor: '#18181b' };
    }
    switch (currentPhase) {
      case 'focus':
        return { backgroundColor: '#f5f3ff' };
      case 'shortBreak':
        return { backgroundColor: '#ecfdf5' };
      case 'longBreak':
        return { backgroundColor: '#f0f9ff' };
      default:
        return { backgroundColor: '#f5f3ff' };
    }
  };

  // Update document title for web
  useEffect(() => {
    if (Platform.OS === 'web') {
      const phaseLabels = {
        focus: '🎯 Focus',
        shortBreak: '☕ Short Break',
        longBreak: '🌴 Long Break',
      };

      document.title = `${timeRemaining > 0 ? formatTime(timeRemaining) : '00:00'} - ${phaseLabels[currentPhase]} | Pomodoro Timer`;
    }
  }, [timeRemaining, currentPhase]);

  // Helper to format time for display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <SafeAreaView style={[styles.container, getBackgroundStyle()]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, isDarkMode && styles.titleDark]}>Pomodoro Timer</Text>
        </View>

        <View style={styles.timerSection}>
          <TimerDisplay
            timeRemaining={timeRemaining}
            progress={progress}
            phase={currentPhase}
            sessionCount={sessionCount}
            totalSessions={settings.sessionsBeforeLongBreak}
          />

          <TimerControls
            isRunning={isRunning}
            isPaused={isPaused}
            onStart={startTimer}
            onPause={pauseTimer}
            onReset={resetTimer}
            onSkip={skipToNext}
            phase={currentPhase}
          />

          {/* Stop Alarm Button - shows when timer is not running */}
          {!isRunning && timeRemaining === 0 && !isAlarmActive && (
            <TouchableOpacity
              style={[
                styles.stopAlarmButton,
                isDarkMode && styles.stopAlarmButtonDark
              ]}
              onPress={stopAlarm}
            >
              <VolumeX size={20} color="#ef4444" />
              <Text style={[
                styles.stopAlarmText,
                isDarkMode && styles.stopAlarmTextDark
              ]}>
                {t('Stop Alarm')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Custom Toast Component */}
      <Toast config={{
        error: (internal) => (
          <View style={[
            styles.toastContainer,
            isDarkMode && styles.toastContainerDark,
            isSmallScreen && styles.toastContainerSmall
          ]}>
            <VolumeX size={isSmallScreen ? 22 : 26} color="#ef4444" style={{ marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <Text style={[
                styles.toastTitle,
                isDarkMode && styles.toastTitleDark,
                isSmallScreen && styles.toastTitleSmall
              ]}>{internal.text1}</Text>
              <Text style={[
                styles.toastDesc,
                isDarkMode && styles.toastDescDark,
                isSmallScreen && styles.toastDescSmall
              ]}>{internal.text2}</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.toastButton,
                isDarkMode && styles.toastButtonDark
              ]}
              onPress={() => {
                console.log('Toast Stop Alarm pressed');
                if (internal.props?.onStop) {
                  internal.props.onStop();
                }
              }}
            >
              <Text style={styles.toastButtonText}>{t('Stop Alarm')}</Text>
            </TouchableOpacity>
          </View>
        )
      }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    paddingTop: 16,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins-SemiBold',
    color: '#1e293b',
    textAlign: 'center',
  },
  titleDark: {
    color: '#f1f5f9',
  },
  timerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  stopAlarmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  stopAlarmButtonDark: {
    backgroundColor: '#1f2937',
    borderColor: '#374151',
  },
  stopAlarmText: {
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#dc2626',
  },
  stopAlarmTextDark: {
    color: '#fca5a5',
  },
  toastContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  toastContainerDark: {
    backgroundColor: '#18181b',
  },
  toastContainerSmall: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  toastTitle: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: '#1e293b',
  },
  toastTitleDark: {
    color: '#f1f5f9',
  },
  toastTitleSmall: {
    fontSize: 13,
  },
  toastDesc: {
    fontSize: 13,
    color: '#64748b',
    fontFamily: 'Poppins-Regular',
    marginTop: 2,
  },
  toastDescDark: {
    color: '#cbd5e1',
  },
  toastDescSmall: {
    fontSize: 11,
  },
  toastButton: {
    backgroundColor: '#ef4444',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginLeft: 10,
    alignSelf: 'center',
  },
  toastButtonDark: {
    backgroundColor: '#dc2626',
  },
  toastButtonText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
  },
});