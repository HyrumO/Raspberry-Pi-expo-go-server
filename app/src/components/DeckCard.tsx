import { View, Text, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { Deck } from '../types/deck';
import { getCardsByDeck, getCardsDueForReview } from '../services/database';

interface DeckCardProps {
  deck: Deck;
  onPress?: () => void;
}

export function DeckCard({ deck, onPress }: DeckCardProps) {
  const { isDark } = useTheme();
  const [cardsDue, setCardsDue] = useState(0);

  useEffect(() => {
    loadCardsDue();
  }, [deck.id]);

  const loadCardsDue = async () => {
    try {
      const allDueCards = await getCardsDueForReview(1000);
      const deckCards = await getCardsByDeck(deck.id);
      const deckCardIds = new Set(deckCards.map(c => c.id));
      const dueInDeck = allDueCards.filter(c => deckCardIds.has(c.id));
      setCardsDue(dueInDeck.length);
    } catch (error) {
      console.error('Error loading cards due:', error);
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`p-5 rounded-xl mb-3 ${isDark ? 'bg-surface-dark' : 'bg-surface-light'}`}
      activeOpacity={0.7}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.1 : 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <View className="flex-row items-start">
        <View className={`w-12 h-12 rounded-lg items-center justify-center mr-4 ${isDark ? 'bg-primary/20' : 'bg-primary/10'}`}>
          <Ionicons name="folder" size={24} color="#14b8a6" />
        </View>
        <View className="flex-1">
          <Text className={`text-lg font-semibold mb-1 ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
            {deck.name}
          </Text>
          {deck.description && (
            <Text className={`text-sm mb-3 ${isDark ? 'text-text-muted' : 'text-text-muted'}`}>
              {deck.description}
            </Text>
          )}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="document-text" size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
              <Text className={`ml-1 text-sm ${isDark ? 'text-text-muted' : 'text-text-muted'}`}>
                {deck.card_count} cards
              </Text>
            </View>
            {cardsDue > 0 && (
              <View className="flex-row items-center">
                <Ionicons name="time" size={16} color="#14b8a6" />
                <Text className={`ml-1 text-sm font-semibold ${isDark ? 'text-primary' : 'text-primary-dark'}`}>
                  {cardsDue} due
                </Text>
              </View>
            )}
          </View>
        </View>
        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color={isDark ? '#9ca3af' : '#6b7280'} 
          style={{ marginLeft: 8 }}
        />
      </View>
    </TouchableOpacity>
  );
}

