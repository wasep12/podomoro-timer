import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    
    // Update stats based on completed phase
    switch (currentPhase) {
      case 'focus':
        setStats((prev) => ({
          ...prev,
          completedFocus: prev.completedFocus + 1,
          totalFocusTime: prev.totalFocusTime + settings.focusDuration,
        }));
        
        // Determine next phase
        if ((sessionCount + 1) % settings.sessionsBeforeLongBreak === 0) {
          setCurrentPhase('longBreak');
        } else {
          setCurrentPhase('shortBreak');
        }
        
        setSessionCount((prev) => prev + 1);
        break;
      
      case 'shortBreak':
        setStats((prev) => ({
          ...prev,
          completedShortBreaks: prev.completedShortBreaks + 1,
        }));
        setCurrentPhase('focus');
        break;
      
      case 'longBreak':
        setStats((prev) => ({
          ...prev,
          completedLongBreaks: prev.completedLongBreaks + 1,
        }));
        setCurrentPhase('focus');
        break;
    }
    
    // Auto-start next session if enabled
    if (
      (currentPhase === 'focus' && settings.autoStartBreaks) ||
      ((currentPhase === 'shortBreak' || currentPhase === 'longBreak') && settings.autoStartPomodoros)
    ) {
      setTimeout(() => {
        setIsRunning(true);
        setLastTick(Date.now());
      }, 1000);
    }
  };
  
  const startTimer = () => {
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