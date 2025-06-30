import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppSettings } from './AppSettingsContext';
import { Platform } from 'react';

export type TimerPhase = 'focus' | 'shortBreak' | 'longBreak';

interface PomodoroSettings {
  focusDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  sessionsBeforeLongBreak: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
}

interface PomodoroStats {
  completedFocus: number;
  completedShortBreaks: number;
  completedLongBreaks: number;
  totalFocusTime: number; // in minutes
}

interface PomodoroContextType {
  settings: PomodoroSettings;
  stats: PomodoroStats;
  currentPhase: TimerPhase;
  isRunning: boolean;
  isPaused: boolean;
  timeRemaining: number; // in seconds
  sessionCount: number;
  progress: number; // 0 to 1

  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  skipToNext: () => void;

  updateSettings: (newSettings: Partial<PomodoroSettings>) => void;
  isAlarmActive: boolean;
  handleAcknowledgeAlarm: () => void;
}

const defaultSettings: PomodoroSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,
  autoStartBreaks: true,
  autoStartPomodoros: true,
};

const defaultStats: PomodoroStats = {
  completedFocus: 0,
  completedShortBreaks: 0,
  completedLongBreaks: 0,
  totalFocusTime: 0,
};

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

export const PomodoroProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<PomodoroSettings>(defaultSettings);
  const [stats, setStats] = useState<PomodoroStats>(defaultStats);
  const [currentPhase, setCurrentPhase] = useState<TimerPhase>('focus');
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(defaultSettings.focusDuration * 60);
  const [sessionCount, setSessionCount] = useState(0);
  const [lastTick, setLastTick] = useState(Date.now());
  const [isAlarmActive, setIsAlarmActive] = useState(false);

  // Get playAlarm function from AppSettings context
  const { playAlarm, stopAlarm } = useAppSettings();

  // Simpan next phase dan stats sementara saat alarm aktif
  const [pendingPhase, setPendingPhase] = useState<TimerPhase | null>(null);
  const [pendingStats, setPendingStats] = useState<any>(null);

  // Load settings and stats from AsyncStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem('pomodoroSettings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }

        const savedStats = await AsyncStorage.getItem('pomodoroStats');
        if (savedStats) {
          setStats(JSON.parse(savedStats));
        }
      } catch (error) {
        console.error('Failed to load data from storage:', error);
      }
    };

    loadData();
  }, []);

  // Save settings when they change
  useEffect(() => {
    const saveSettings = async () => {
      try {
        await AsyncStorage.setItem('pomodoroSettings', JSON.stringify(settings));
      } catch (error) {
        console.error('Failed to save settings:', error);
      }
    };

    saveSettings();
  }, [settings]);

  // Save stats when they change
  useEffect(() => {
    const saveStats = async () => {
      try {
        await AsyncStorage.setItem('pomodoroStats', JSON.stringify(stats));
      } catch (error) {
        console.error('Failed to save stats:', error);
      }
    };

    saveStats();
  }, [stats]);

  // Reset timer when changing phases
  useEffect(() => {
    let newDuration = 0;

    switch (currentPhase) {
      case 'focus':
        newDuration = settings.focusDuration * 60;
        break;
      case 'shortBreak':
        newDuration = settings.shortBreakDuration * 60;
        break;
      case 'longBreak':
        newDuration = settings.longBreakDuration * 60;
        break;
    }

    setTimeRemaining(newDuration);
  }, [currentPhase, settings]);

  // Timer logic
  useEffect(() => {
    if (!isRunning) return;

    const intervalId = setInterval(() => {
      const now = Date.now();
      const delta = Math.floor((now - lastTick) / 1000);
      setLastTick(now);

      setTimeRemaining((prev) => {
        const newTime = Math.max(0, prev - delta);

        // Timer completed
        if (newTime === 0) {
          handleTimerComplete();
          return 0;
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isRunning, lastTick]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    if (!isAlarmActive) {
      setIsAlarmActive(true);
      playAlarm();
      console.log('handleTimerComplete: playAlarm dipanggil');
    } else {
      console.log('handleTimerComplete: playAlarm tidak dipanggil karena alarm sudah aktif');
    }
    // Simpan perubahan phase dan stats yang akan dieksekusi setelah acknowledge
    let nextPhase: TimerPhase = currentPhase;
    let statsUpdate: any = null;
    switch (currentPhase) {
      case 'focus':
        statsUpdate = {
          completedFocus: stats.completedFocus + 1,
          totalFocusTime: stats.totalFocusTime + settings.focusDuration,
        };
        if ((sessionCount + 1) % settings.sessionsBeforeLongBreak === 0) {
          nextPhase = 'longBreak';
        } else {
          nextPhase = 'shortBreak';
        }
        break;
      case 'shortBreak':
        statsUpdate = {
          completedShortBreaks: stats.completedShortBreaks + 1,
        };
        nextPhase = 'focus';
        break;
      case 'longBreak':
        statsUpdate = {
          completedLongBreaks: stats.completedLongBreaks + 1,
        };
        nextPhase = 'focus';
        break;
    }
    setPendingPhase(nextPhase);
    setPendingStats(statsUpdate);
  };

  // Fungsi untuk melanjutkan siklus setelah acknowledge alarm
  const handleAcknowledgeAlarm = () => {
    console.log('handleAcknowledgeAlarm dipanggil');
    stopAlarm();
    setIsAlarmActive(false);
    // Update stats dan phase
    if (pendingStats) {
      setStats((prev: any) => ({ ...prev, ...pendingStats }));
    }
    if (currentPhase === 'focus') {
      setSessionCount((prev) => prev + 1);
    }
    if (pendingPhase) {
      setCurrentPhase(pendingPhase);
    }
    setPendingPhase(null);
    setPendingStats(null);
    // Auto-start next session jika di-setting autoStart
    if (
      (currentPhase === 'focus' && settings.autoStartBreaks) ||
      ((currentPhase === 'shortBreak' || currentPhase === 'longBreak') && settings.autoStartPomodoros)
    ) {
      setTimeout(() => {
        setIsRunning(true);
        setLastTick(Date.now());
      }, 100);
    }
  };

  const startTimer = () => {
    // Stop any playing alarm when starting timer
    stopAlarm();
    setIsAlarmActive(false);
    if (isPaused) {
      setIsPaused(false);
    }
    setIsRunning(true);
    setLastTick(Date.now());
  };

  const pauseTimer = () => {
    setIsRunning(false);
    setIsPaused(true);
  };

  const resetTimer = () => {
    // Stop any playing alarm when resetting timer
    stopAlarm();
    setIsAlarmActive(false);
    setIsRunning(false);
    setIsPaused(false);
    let newDuration = 0;
    switch (currentPhase) {
      case 'focus':
        newDuration = settings.focusDuration * 60;
        break;
      case 'shortBreak':
        newDuration = settings.shortBreakDuration * 60;
        break;
      case 'longBreak':
        newDuration = settings.longBreakDuration * 60;
        break;
    }
    setTimeRemaining(newDuration);
  };

  const skipToNext = () => {
    // Stop any playing alarm when skipping
    stopAlarm();
    setIsAlarmActive(false);
    setIsRunning(false);
    setIsPaused(false);
    // Transition to next phase without counting current one as completed
    if (currentPhase === 'focus') {
      if ((sessionCount + 1) % settings.sessionsBeforeLongBreak === 0) {
        setCurrentPhase('longBreak');
      } else {
        setCurrentPhase('shortBreak');
      }
    } else {
      setCurrentPhase('focus');
    }
  };

  const updateSettings = (newSettings: Partial<PomodoroSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));

    // If timer is not running, update current timer duration
    if (!isRunning) {
      resetTimer();
    }
  };

  // Calculate progress
  const getTotalTime = () => {
    switch (currentPhase) {
      case 'focus':
        return settings.focusDuration * 60;
      case 'shortBreak':
        return settings.shortBreakDuration * 60;
      case 'longBreak':
        return settings.longBreakDuration * 60;
    }
  };

  const progress = 1 - timeRemaining / getTotalTime();

  const contextValue: PomodoroContextType = {
    settings,
    stats,
    currentPhase,
    isRunning,
    isPaused,
    timeRemaining,
    sessionCount,
    progress,
    startTimer,
    pauseTimer,
    resetTimer,
    skipToNext,
    updateSettings,
    isAlarmActive,
    handleAcknowledgeAlarm,
  };

  return (
    <PomodoroContext.Provider value={contextValue}>
      {children}
    </PomodoroContext.Provider>
  );
};

export const usePomodoro = () => {
  const context = useContext(PomodoroContext);
  if (context === undefined) {
    throw new Error('usePomodoro must be used within a PomodoroProvider');
  }
  return context;
};

const stopAlarm = async () => {
  console.log('stopAlarm dipanggil');
  if (Platform.OS === 'web') {
    if (webAudio) {
      webAudio.pause();
      webAudio.currentTime = 0;
      webAudio = null;
    }
    return;
  }
  try {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
    }
  } catch (error) {
    console.error('Error stopping alarm:', error);
  } finally {
    setSound(null);
  }
};