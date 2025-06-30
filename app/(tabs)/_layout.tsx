import { Tabs } from 'expo-router';
import { Timer, Settings, BarChart2 } from 'lucide-react-native';
import { Feather } from '@expo/vector-icons';
import { useAppSettings } from '@/context/AppSettingsContext';

export default function TabLayout() {
  const { isDarkMode } = useAppSettings();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: isDarkMode ? '#000' : '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: isDarkMode ? 0.3 : 0.1,
          shadowRadius: 8,
          paddingBottom: 12,
          paddingTop: 8,
          height: 75,
          paddingHorizontal: 16,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
          paddingHorizontal: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
          marginBottom: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Timer',
          tabBarIcon: ({ color, size }) => <Timer size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="statistics"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color, size }) => <BarChart2 size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: 'Notes',
          tabBarIcon: ({ color, size }) => <Feather name="book" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}