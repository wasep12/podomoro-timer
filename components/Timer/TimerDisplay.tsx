import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CircularProgress from './CircularProgress';
import { formatTime } from '@/utils/timeUtils';
import { TimerPhase } from '@/context/PomodoroContext';
import { useTranslation } from 'react-i18next';
import { useAppSettings } from '@/context/AppSettingsContext';

interface TimerDisplayProps {
  timeRemaining: number;
  progress: number;
  phase: TimerPhase;
  sessionCount: number;
  totalSessions: number;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({
  timeRemaining,
  progress,
  phase,
  sessionCount,
  totalSessions,
}) => {
  const { t } = useTranslation();
  const { isDarkMode } = useAppSettings();
  // Set color based on current phase
  const getPhaseColor = () => {
    switch (phase) {
      case 'focus':
        return '#6366f1'; // Indigo
      case 'shortBreak':
        return '#10b981'; // Emerald
      case 'longBreak':
        return '#0ea5e9'; // Sky blue
      default:
        return '#6366f1';
    }
  };

  const getPhaseTitle = () => {
    switch (phase) {
      case 'focus':
        return t('Focus Time');
      case 'shortBreak':
        return t('Short Break');
      case 'longBreak':
        return t('Long Break');
      default:
        return t('Focus Time');
    }
  };

  const phaseColor = getPhaseColor();

  return (
    <View style={styles.container}>
      <Text style={styles.phaseTitle}>{getPhaseTitle()}</Text>

      <View style={styles.timerContainer}>
        <CircularProgress
          progress={progress}
          size={260}
          strokeWidth={12}
          color={phaseColor}
        />
        <View style={styles.timeTextContainer}>
          <Text style={[styles.timeText, isDarkMode && styles.timeTextDark]}>{formatTime(timeRemaining)}</Text>
        </View>
      </View>

      {phase === 'focus' && (
        <View style={styles.sessionIndicator}>
          <Text style={styles.sessionText}>
            Session {sessionCount % totalSessions || totalSessions} of {totalSessions}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Medium',
    color: '#475569',
    marginBottom: 20,
  },
  timerContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 48,
    fontFamily: 'Poppins-Bold',
    color: '#1e293b',
  },
  timeTextDark: {
    color: '#fff',
  },
  sessionIndicator: {
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
  },
  sessionText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#475569',
  },
});

export default TimerDisplay;