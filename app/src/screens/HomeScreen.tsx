import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { getCardsDueForReview, getDailyStats, getDecks } from '../services/database';
import { config } from '../constants/config';

export default function HomeScreen() {
  const { isDark } = useTheme();
  const navigation = useNavigation();
  const [cardsDue, setCardsDue] = useState(0);
  const [todayReviewed, setTodayReviewed] = useState(0);
  const [streak, setStreak] = useState(0);
  const [totalDecks, setTotalDecks] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const [dueCards, decks, dailyStats] = await Promise.all([
        getCardsDueForReview(1000),
        getDecks(),
        getDailyStats(1),
      ]);

      setCardsDue(dueCards.length);
      setTotalDecks(decks.length);

      const today = new Date().toISOString().split('T')[0];
      const todayStat = dailyStats.find((stat: any) => stat.date === today);
      setTodayReviewed(todayStat?.cards_reviewed || 0);

      // Calculate streak
      let currentStreak = 0;
      for (let i = 0; i < 365; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayStat = dailyStats.find((stat: any) => stat.date === dateStr);
        if (dayStat && dayStat.cards_reviewed > 0) {
          currentStreak++;
        } else if (i > 0) {
          break;
        }
      }
      setStreak(currentStreak);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const dailyGoal = config.goals.defaultDailyCards;
  const progressPercentage = Math.min((todayReviewed / dailyGoal) * 100, 100);

  const hasContent = totalDecks > 0 || cardsDue > 0;

  return (
    <View className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background-light'}`}>
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Header */}
        <View className="mb-6 mt-2">
          <Text className={`text-2xl font-bold mb-1 ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
            Welcome Back!
          </Text>
          <Text className={`text-sm ${isDark ? 'text-text-muted' : 'text-text-muted'}`}>
            Ready to continue your Arabic learning journey?
          </Text>
        </View>

        {/* Quick Actions */}
        <View className="mb-6">
          <Text className={`text-lg font-semibold mb-4 ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
            Quick Actions
          </Text>
          <View className="flex-row">
            {/* Start Button - Yellow */}
            <TouchableOpacity
              onPress={() => navigation.navigate('Decks' as never)}
              className="flex-1 p-5 rounded-2xl items-center justify-center mr-2"
              style={{ backgroundColor: '#fbbf24' }}
            >
              <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center mb-3">
                <Ionicons name="add-circle" size={28} color="white" />
              </View>
              <Text className="text-white text-xl font-bold mb-1">Start</Text>
              <Text className="text-white/90 text-xs text-center">Begin new learning session</Text>
            </TouchableOpacity>

            {/* Review Button - Teal */}
            <TouchableOpacity
              onPress={() => navigation.navigate('Review' as never)}
              className="flex-1 p-5 rounded-2xl items-center justify-center ml-2"
              style={{ backgroundColor: '#14b8a6', opacity: cardsDue === 0 ? 0.6 : 1 }}
              disabled={cardsDue === 0}
            >
              <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center mb-3">
                <Ionicons name="refresh" size={28} color="white" />
              </View>
              <Text className="text-white text-xl font-bold mb-1">Review</Text>
              <Text className="text-white/90 text-xs text-center">
                {cardsDue > 0 ? `${cardsDue} cards due` : 'No cards due'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Today's Stats */}
        <View className="mb-6">
          <Text className={`text-lg font-semibold mb-4 ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
            Today's Stats
          </Text>
          
          {/* Words Learned */}
          <View className={`mb-4 p-4 rounded-xl ${isDark ? 'bg-surface-dark' : 'bg-surface-light'}`}>
            <View className="flex-row justify-between items-center mb-2">
              <Text className={`text-sm font-medium ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
                Words Learned
              </Text>
              <Text className={`text-sm font-semibold ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
                {todayReviewed} / {dailyGoal}
              </Text>
            </View>
            <View className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-background-dark' : 'bg-gray-200'}`}>
              <View
                className="h-full rounded-full"
                style={{ width: `${progressPercentage}%`, backgroundColor: '#14b8a6' }}
              />
            </View>
          </View>

          {/* Daily Goal */}
          <View className={`p-4 rounded-xl ${isDark ? 'bg-surface-dark' : 'bg-surface-light'}`}>
            <View className="flex-row justify-between items-center mb-2">
              <Text className={`text-sm font-medium ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
                Daily Goal
              </Text>
              <Text className={`text-sm font-semibold`} style={{ color: '#fbbf24' }}>
                {Math.round(progressPercentage)}%
              </Text>
            </View>
            <View className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-background-dark' : 'bg-gray-200'}`}>
              <View
                className="h-full rounded-full"
                style={{ width: `${progressPercentage}%`, backgroundColor: '#fbbf24' }}
              />
            </View>
          </View>
        </View>

        {/* No Cards Due Message */}
        {cardsDue === 0 && hasContent && (
          <View className={`mb-6 p-4 rounded-xl flex-row items-center ${isDark ? 'bg-surface-dark' : 'bg-surface-light'}`}>
            <Ionicons name="checkmark-circle" size={24} color="#14b8a6" />
            <View className="ml-3 flex-1">
              <Text className={`font-semibold mb-1 ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
                No cards due today
              </Text>
              <Text className={`text-xs ${isDark ? 'text-text-muted' : 'text-text-muted'}`}>
                Review a deck to get started
              </Text>
            </View>
          </View>
        )}

        {/* Decks Section */}
        {hasContent && (
          <View className="mb-6">
            <Text className={`text-lg font-semibold mb-4 ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
              Decks
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Decks' as never)}
              className={`p-4 rounded-xl flex-row items-center ${isDark ? 'bg-surface-dark' : 'bg-surface-light'}`}
            >
              <Ionicons name="folder" size={24} color="#14b8a6" />
              <View className="ml-3 flex-1">
                <Text className={`font-semibold ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
                  Browse all decks
                </Text>
                <Text className={`text-xs mt-1 ${isDark ? 'text-text-muted' : 'text-text-muted'}`}>
                  {totalDecks} {totalDecks === 1 ? 'deck' : 'decks'} available
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
            </TouchableOpacity>
          </View>
        )}

        {/* Empty State */}
        {!hasContent && (
          <View className={`p-8 rounded-xl items-center ${isDark ? 'bg-surface-dark' : 'bg-surface-light'}`}>
            <Ionicons name="book-outline" size={64} color={isDark ? '#9ca3af' : '#6b7280'} />
            <Text className={`text-xl font-semibold mt-4 mb-2 ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
              Get Started
            </Text>
            <Text className={`text-center text-sm mb-6 ${isDark ? 'text-text-muted' : 'text-text-muted'}`}>
              Import an Anki deck to start learning Arabic vocabulary!
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Decks' as never)}
              className="bg-primary px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-semibold">Import Anki Deck</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

