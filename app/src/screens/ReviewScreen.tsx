import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { Flashcard } from '../components/Flashcard';
import { Card } from '../types/card';
import { DifficultyRating } from '../types/review';
import { getCardsDueForReview, updateCardProgress, getCardProgress, updateDailyStats } from '../services/database';
import { calculateSpacedRepetition } from '../services/spacedRepetition';

export default function ReviewScreen() {
  const { isDark } = useTheme();
  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionStats, setSessionStats] = useState({ reviewed: 0, correct: 0, incorrect: 0 });

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      setIsLoading(true);
      const dueCards = await getCardsDueForReview(20);
      setCards(dueCards);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Error loading cards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDifficulty = async (difficulty: DifficultyRating) => {
    if (cards.length === 0) return;

    const currentCard = cards[currentIndex];
    const progress = await getCardProgress(currentCard.id);

    if (progress) {
      const result = calculateSpacedRepetition(
        progress.ease_factor,
        progress.interval,
        difficulty
      );

      await updateCardProgress(
        currentCard.id,
        difficulty,
        result.newEaseFactor,
        result.newInterval
      );

      // Update session stats
      const isCorrect = difficulty !== 'hard';
      setSessionStats(prev => ({
        reviewed: prev.reviewed + 1,
        correct: prev.correct + (isCorrect ? 1 : 0),
        incorrect: prev.incorrect + (isCorrect ? 0 : 1),
      }));
    }

    // Move to next card or finish
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Save daily stats and reload
      await updateDailyStats(sessionStats.reviewed + 1, sessionStats.correct + (difficulty !== 'hard' ? 1 : 0), sessionStats.incorrect + (difficulty === 'hard' ? 1 : 0));
      await loadCards();
      setSessionStats({ reviewed: 0, correct: 0, incorrect: 0 });
    }
  };

  if (isLoading) {
    return (
      <View className={`flex-1 items-center justify-center ${isDark ? 'bg-background-dark' : 'bg-background-light'}`}>
        <Text className={isDark ? 'text-text-dark' : 'text-text-light'}>Loading cards...</Text>
      </View>
    );
  }

  if (cards.length === 0) {
    return (
      <View className={`flex-1 items-center justify-center p-4 ${isDark ? 'bg-background-dark' : 'bg-background-light'}`}>
        <Text className={`text-xl font-semibold mb-2 ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
          No cards due for review!
        </Text>
        <Text className={`text-center ${isDark ? 'text-text-muted' : 'text-text-muted'}`}>
          Great job! You've reviewed all your cards for today.
        </Text>
      </View>
    );
  }

  const currentCard = cards[currentIndex];
  const progress = currentIndex + 1;
  const total = cards.length;

  return (
    <View className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background-light'}`}>
      <ScrollView className="flex-1 p-4">
        <View className="mb-4">
          <Text className={`text-sm ${isDark ? 'text-text-muted' : 'text-text-muted'}`}>
            Card {progress} of {total}
          </Text>
        </View>

        <Flashcard card={currentCard} />

        <View className="mt-4 space-y-3">
          <TouchableOpacity
            onPress={() => handleDifficulty('easy')}
            className="bg-green-600 p-4 rounded-lg"
          >
            <Text className="text-white text-center font-semibold">Easy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleDifficulty('good')}
            className="bg-primary p-4 rounded-lg"
          >
            <Text className="text-white text-center font-semibold">Good</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleDifficulty('hard')}
            className="bg-red-600 p-4 rounded-lg"
          >
            <Text className="text-white text-center font-semibold">Hard</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

