import 'intl-pluralrules';
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { PomodoroProvider } from '@/context/PomodoroContext';
import { AppSettingsProvider } from '@/context/AppSettingsContext';
import { useFonts } from 'expo-font';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold
} from '@expo-google-fonts/poppins';
import { SplashScreen } from 'expo-router';
import '../i18n';
import Toast from 'react-native-toast-message';
import CustomSplashScreen from '@/components/SplashScreen';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();
  const [showCustomSplash, setShowCustomSplash] = useState(true);

  const [fontsLoaded, fontError] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
    'Poppins-Bold': Poppins_700Bold,
  });

  // Hide splash screen once fonts are loaded
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  const handleSplashFinish = () => {
    setShowCustomSplash(false);
  };

  // Show custom splash screen first
  if (showCustomSplash) {
    return (
      <AppSettingsProvider>
        <CustomSplashScreen onFinish={handleSplashFinish} />
      </AppSettingsProvider>
    );
  }

  // Return null to keep splash screen visible while fonts load
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AppSettingsProvider>
      <PomodoroProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" options={{ title: 'Oops!' }} />
        </Stack>
        <Toast />
        <StatusBar style="auto" />
      </PomodoroProvider>
    </AppSettingsProvider>
  );
}