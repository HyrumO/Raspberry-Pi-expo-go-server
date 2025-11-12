import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Deck } from '../types/deck';

interface DeckCardProps {
  deck: Deck;
  onPress?: () => void;
}

export function DeckCard({ deck, onPress }: DeckCardProps) {
  const { isDark } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`p-4 rounded-lg mb-3 ${isDark ? 'bg-surface-dark' : 'bg-surface-light'}`}
      activeOpacity={0.7}
    >
      <View className="flex-row justify-between items-center">
        <View className="flex-1">
          <Text className={`text-lg font-semibold mb-1 ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
            {deck.name}
          </Text>
          {deck.description && (
            <Text className={`text-sm mb-2 ${isDark ? 'text-text-muted' : 'text-text-muted'}`}>
              {deck.description}
            </Text>
          )}
          <Text className={`text-sm ${isDark ? 'text-primary' : 'text-primary-dark'}`}>
            {deck.card_count} cards
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

