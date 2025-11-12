import { View, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '../hooks/useTheme';

export function ThemeToggle() {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      className="flex-row items-center justify-between p-4 bg-surface dark:bg-surface-dark rounded-lg"
    >
      <Text className="text-text dark:text-text-dark text-base font-medium">
        Theme
      </Text>
      <Text className="text-text-muted text-sm">
        {isDark ? 'Dark' : 'Light'}
      </Text>
    </TouchableOpacity>
  );
}

