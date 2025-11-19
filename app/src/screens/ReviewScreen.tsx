import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
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

    if (!progress) {
      console.error('Card progress not found for card:', currentCard.id);
      // Skip to next card or handle error
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        await loadCards();
      }
      return;
    }

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

    // Calculate updated session stats
    const isCorrect = difficulty !== 'hard';
    const updatedStats = {
      reviewed: sessionStats.reviewed + 1,
      correct: sessionStats.correct + (isCorrect ? 1 : 0),
      incorrect: sessionStats.incorrect + (isCorrect ? 0 : 1),
    };

    // Move to next card or finish
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSessionStats(updatedStats);
    } else {
      // Save daily stats with updated values (no double counting)
      await updateDailyStats(updatedStats.reviewed, updatedStats.correct, updatedStats.incorrect);
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
  const progressPercentage = (progress / total) * 100;

  return (
    <View className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background-light'}`}>
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Indicator */}
        <View className={`mb-6 p-4 rounded-xl mt-2 ${isDark ? 'bg-surface-dark' : 'bg-surface-light'}`}>
          <View className="flex-row justify-between items-center mb-2">
            <Text className={`text-sm font-semibold ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
              Card {progress} of {total}
            </Text>
            <Text className={`text-sm font-semibold ${isDark ? 'text-text-muted' : 'text-text-muted'}`}>
              {Math.round(progressPercentage)}%
            </Text>
          </View>
          <View className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-background-dark' : 'bg-gray-200'}`}>
            <View
              className="h-full bg-primary rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </View>
        </View>

        <Flashcard card={currentCard} />

        <View className="mt-6 space-y-3">
          <TouchableOpacity
            onPress={() => handleDifficulty('easy')}
            className="bg-green-600 p-5 rounded-xl flex-row items-center justify-center"
            style={{
              shadowColor: '#16a34a',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <Ionicons name="checkmark-circle" size={24} color="white" />
            <Text className="text-white text-center font-semibold text-lg ml-2">Easy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleDifficulty('good')}
            className="bg-primary p-5 rounded-xl flex-row items-center justify-center"
            style={{
              shadowColor: '#14b8a6',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <Ionicons name="thumbs-up" size={24} color="white" />
            <Text className="text-white text-center font-semibold text-lg ml-2">Good</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleDifficulty('hard')}
            className="bg-red-600 p-5 rounded-xl flex-row items-center justify-center"
            style={{
              shadowColor: '#dc2626',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <Ionicons name="close-circle" size={24} color="white" />
            <Text className="text-white text-center font-semibold text-lg ml-2">Hard</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

