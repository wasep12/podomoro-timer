import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, ColorValue } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
  withRepeat,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppSettings } from '@/context/AppSettingsContext';
import { Clock } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const { isDarkMode } = useAppSettings();

  // Animasi values
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const logoRotation = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(50);
  const progressOpacity = useSharedValue(0);
  const progressWidth = useSharedValue(0);
  const iconScale = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const progressGlow = useSharedValue(0);
  const handRotation = useSharedValue(0);

  // Background gradient colors
  const gradientColors = isDarkMode
    ? ['#1a1a2e', '#16213e', '#0f3460'] as [string, string, string]
    : ['#667eea', '#764ba2', '#f093fb'] as [string, string, string];

  const startAnimations = () => {
    // Logo animation sequence
    logoScale.value = withSequence(
      withTiming(1.2, { duration: 800, easing: Easing.out(Easing.cubic) }),
      withSpring(1, { damping: 10, stiffness: 100 })
    );

    logoOpacity.value = withTiming(1, { duration: 600 });
    logoRotation.value = withTiming(360, { duration: 1000, easing: Easing.out(Easing.cubic) });

    // Pulse animation for logo
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Icon animation
    iconScale.value = withDelay(200, withSequence(
      withTiming(1.3, { duration: 600, easing: Easing.out(Easing.cubic) }),
      withSpring(1, { damping: 8, stiffness: 120 })
    ));

    // Clock hand rotation
    handRotation.value = withDelay(400, withTiming(180, { duration: 1200, easing: Easing.out(Easing.cubic) }));

    // Text animation with delay
    textOpacity.value = withDelay(600, withTiming(1, { duration: 800 }));
    textTranslateY.value = withDelay(600, withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) }));

    // Progress bar animation
    progressOpacity.value = withDelay(800, withTiming(1, { duration: 400 }));
    progressWidth.value = withDelay(1000, withTiming(width * 0.8, { duration: 1500, easing: Easing.out(Easing.cubic) }));

    // Progress glow animation
    progressGlow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Finish splash screen after animations
    setTimeout(() => {
      runOnJS(onFinish)();
    }, 3500);
  };

  useEffect(() => {
    startAnimations();
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value * pulseScale.value },
      { rotate: `${logoRotation.value}deg` },
    ],
    opacity: logoOpacity.value,
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const handAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${handRotation.value}deg` }],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    opacity: progressOpacity.value,
    width: progressWidth.value,
  }));

  const progressGlowStyle = useAnimatedStyle(() => ({
    opacity: progressGlow.value,
  }));

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={gradientColors}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          {/* Logo Container */}
          <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
            <View style={[styles.logo, isDarkMode && styles.logoDark]}>
              <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
                <View style={[styles.clockFace, isDarkMode && styles.clockFaceDark]}>
                  <View style={[styles.clockCenter, isDarkMode && styles.clockCenterDark]} />
                  <Animated.View style={[styles.clockHand, handAnimatedStyle, isDarkMode && styles.clockHandDark]} />
                  <View style={[styles.clockMark, styles.clockMark12, isDarkMode && styles.clockMarkDark]} />
                  <View style={[styles.clockMark, styles.clockMark3, isDarkMode && styles.clockMarkDark]} />
                  <View style={[styles.clockMark, styles.clockMark6, isDarkMode && styles.clockMarkDark]} />
                  <View style={[styles.clockMark, styles.clockMark9, isDarkMode && styles.clockMarkDark]} />
                </View>
              </Animated.View>
            </View>
          </Animated.View>

          {/* App Title */}
          <Animated.View style={[styles.titleContainer, textAnimatedStyle]}>
            <Animated.Text style={[styles.title, isDarkMode && styles.titleDark]}>
              Pomodoro Timer
            </Animated.Text>
            <Animated.Text style={[styles.subtitle, isDarkMode && styles.subtitleDark]}>
              Focus • Break • Repeat
            </Animated.Text>
          </Animated.View>

          {/* Progress Bar */}
          <View style={styles.progressWrapper}>
            <Animated.View style={[styles.progressContainer, progressAnimatedStyle]}>
              <View style={[styles.progressBar, isDarkMode && styles.progressBarDark]}>
                <Animated.View style={[styles.progressFill, progressAnimatedStyle]} />
                <Animated.View style={[styles.progressGlow, progressGlowStyle]} />
              </View>
            </Animated.View>
            <Animated.Text style={[styles.progressText, isDarkMode && styles.progressTextDark]}>
              Loading...
            </Animated.Text>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  logoContainer: {
    marginBottom: 50,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  logoDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  clockFace: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  clockFaceDark: {
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  clockCenter: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366f1',
    position: 'absolute',
    zIndex: 3,
  },
  clockCenterDark: {
    backgroundColor: '#ffffff',
  },
  clockHand: {
    width: 2,
    height: 25,
    backgroundColor: '#6366f1',
    borderRadius: 1,
    position: 'absolute',
    top: 8,
    transform: [{ translateY: 0 }],
    zIndex: 2,
  },
  clockHandDark: {
    backgroundColor: '#ffffff',
  },
  clockMark: {
    position: 'absolute',
    backgroundColor: '#6366f1',
    borderRadius: 1,
  },
  clockMarkDark: {
    backgroundColor: '#ffffff',
  },
  clockMark12: {
    width: 2,
    height: 6,
    top: 4,
    left: '50%',
    marginLeft: -1,
  },
  clockMark3: {
    width: 6,
    height: 2,
    top: '50%',
    right: 4,
    marginTop: -1,
  },
  clockMark6: {
    width: 2,
    height: 6,
    bottom: 4,
    left: '50%',
    marginLeft: -1,
  },
  clockMark9: {
    width: 6,
    height: 2,
    top: '50%',
    left: 4,
    marginTop: -1,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 38,
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  titleDark: {
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitleDark: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  progressWrapper: {
    alignItems: 'center',
  },
  progressContainer: {
    width: width * 0.8,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    position: 'relative',
  },
  progressBarDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 4,
    position: 'relative',
  },
  progressGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  progressTextDark: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
}); 