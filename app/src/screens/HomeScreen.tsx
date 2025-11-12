import { View, Text } from 'react-native';
import { useTheme } from '../hooks/useTheme';

export default function HomeScreen() {
  const { isDark } = useTheme();

  return (
    <View className={`flex-1 items-center justify-center ${isDark ? 'bg-background-dark' : 'bg-background-light'}`}>
      <Text className={`text-2xl font-bold ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
        Arabic Learning App
      </Text>
      <Text className={`mt-4 ${isDark ? 'text-text-muted' : 'text-text-muted'}`}>
        Welcome! Start learning Arabic today.
      </Text>
    </View>
  );
}

