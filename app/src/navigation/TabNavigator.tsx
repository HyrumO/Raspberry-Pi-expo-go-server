import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import DecksScreen from '../screens/DecksScreen';
import LookupScreen from '../screens/LookupScreen';
import StatsScreen from '../screens/StatsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { useTheme } from '../hooks/useTheme';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const { isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? '#2d2d2d' : '#f3f4f6',
          borderTopColor: isDark ? '#404040' : '#e5e7eb',
        },
        tabBarActiveTintColor: '#14b8a6',
        tabBarInactiveTintColor: isDark ? '#9ca3af' : '#6b7280',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Decks"
        component={DecksScreen}
        options={{
          tabBarLabel: 'Decks',
        }}
      />
      <Tab.Screen
        name="Lookup"
        component={LookupScreen}
        options={{
          tabBarLabel: 'Lookup',
        }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          tabBarLabel: 'Stats',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
}

