import React, { useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePomodoro } from '@/context/PomodoroContext';
import TimerDisplay from '@/components/Timer/TimerDisplay';
import TimerControls from '@/components/Timer/TimerControls';
import { useKeepAwake } from 'expo-keep-awake';
import { useAppSettings } from '@/context/AppSettingsContext';

export default function TimerScreen() {
  // Keep screen awake during active pomodoro sessions only on native platforms
  if (Platform.OS !== 'web') {
    useKeepAwake();
  }

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
  } = usePomodoro();
  const { isDarkMode } = useAppSettings();

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
        </View>
      </ScrollView>
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
});