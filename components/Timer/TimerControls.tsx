import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Play, Pause, SkipForward, RotateCcw } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { TimerPhase } from '@/context/PomodoroContext';

interface TimerControlsProps {
  isRunning: boolean;
  isPaused: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSkip: () => void;
  phase: TimerPhase;
}

const TimerControls: React.FC<TimerControlsProps> = ({
  isRunning,
  isPaused,
  onStart,
  onPause,
  onReset,
  onSkip,
  phase,
}) => {
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
  
  const color = getPhaseColor();
  
  const triggerHapticFeedback = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };
  
  const handlePlayPause = () => {
    triggerHapticFeedback();
    if (isRunning) {
      onPause();
    } else {
      onStart();
    }
  };
  
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => {
          triggerHapticFeedback();
          onReset();
        }}
        activeOpacity={0.7}
      >
        <RotateCcw color="#64748b" size={24} />
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.primaryButton, { backgroundColor: color }]}
        onPress={handlePlayPause}
        activeOpacity={0.7}
      >
        {isRunning ? (
          <Pause color="white" size={30} />
        ) : (
          <Play color="white" size={30} />
        )}
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => {
          triggerHapticFeedback();
          onSkip();
        }}
        activeOpacity={0.7}
      >
        <SkipForward color="#64748b" size={24} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  primaryButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TimerControls;