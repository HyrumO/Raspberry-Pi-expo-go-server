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
    <ScrollView className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background-light'}`}>
      <View className="p-4">
        {/* Welcome Section */}
        <View className="mb-6">
          <Text className={`text-3xl font-bold mb-2 ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
            Welcome Back!
          </Text>
          <Text className={`text-base ${isDark ? 'text-text-muted' : 'text-text-muted'}`}>
            Ready to continue your Arabic learning journey?
          </Text>
        </View>

        {/* Quick Actions */}
        {hasContent ? (
          <View className="mb-6">
            <Text className={`text-lg font-semibold mb-3 ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
              Quick Actions
            </Text>
            <View className="space-y-3">
              <TouchableOpacity
                onPress={() => navigation.navigate('Review' as never)}
                className="bg-primary p-4 rounded-xl flex-row items-center justify-between"
                disabled={cardsDue === 0}
                style={{ opacity: cardsDue === 0 ? 0.5 : 1 }}
              >
                <View className="flex-row items-center flex-1">
                  <Ionicons name="book" size={24} color="white" />
                  <View className="ml-3 flex-1">
                    <Text className="text-white text-lg font-semibold">Start Review</Text>
                    <Text className="text-white/80 text-sm">
                      {cardsDue > 0 ? `${cardsDue} cards due` : 'No cards due'}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="white" />
              </TouchableOpacity>

              <View className="flex-row space-x-3">
                <TouchableOpacity
                  onPress={() => navigation.navigate('Decks' as never)}
                  className={`flex-1 p-4 rounded-xl flex-row items-center justify-center ${isDark ? 'bg-surface-dark' : 'bg-surface-light'}`}
                >
                  <Ionicons name="folder" size={20} color={isDark ? '#14b8a6' : '#14b8a6'} />
                  <Text className={`ml-2 font-semibold ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
                    Browse Decks
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => navigation.navigate('Lookup' as never)}
                  className={`flex-1 p-4 rounded-xl flex-row items-center justify-center ${isDark ? 'bg-surface-dark' : 'bg-surface-light'}`}
                >
                  <Ionicons name="search" size={20} color={isDark ? '#14b8a6' : '#14b8a6'} />
                  <Text className={`ml-2 font-semibold ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
                    Lookup Word
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <View className={`mb-6 p-6 rounded-xl ${isDark ? 'bg-surface-dark' : 'bg-surface-light'}`}>
            <Ionicons name="book-outline" size={48} color={isDark ? '#9ca3af' : '#6b7280'} style={{ alignSelf: 'center', marginBottom: 12 }} />
            <Text className={`text-center text-lg font-semibold mb-2 ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
              Get Started
            </Text>
            <Text className={`text-center text-sm mb-4 ${isDark ? 'text-text-muted' : 'text-text-muted'}`}>
              Import an Anki deck to start learning Arabic vocabulary!
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Decks' as never)}
              className="bg-primary p-3 rounded-lg"
            >
              <Text className="text-white text-center font-semibold">Import Anki Deck</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Today's Stats Preview */}
        {hasContent && (
          <View className={`mb-6 p-4 rounded-xl ${isDark ? 'bg-surface-dark' : 'bg-surface-light'}`}>
            <Text className={`text-lg font-semibold mb-4 ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
              Today's Progress
            </Text>

            {/* Daily Goal Progress */}
            <View className="mb-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className={`text-sm ${isDark ? 'text-text-muted' : 'text-text-muted'}`}>
                  Daily Goal
                </Text>
                <Text className={`text-sm font-semibold ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
                  {todayReviewed} / {dailyGoal}
                </Text>
              </View>
              <View className={`h-3 rounded-full overflow-hidden ${isDark ? 'bg-background-dark' : 'bg-gray-200'}`}>
                <View
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                />
              </View>
            </View>

            {/* Stats Grid */}
            <View className="flex-row space-x-3">
              <View className="flex-1 p-3 rounded-lg" style={{ backgroundColor: isDark ? '#1a1a1a' : '#ffffff' }}>
                <View className="flex-row items-center mb-1">
                  <Ionicons name="time-outline" size={16} color="#14b8a6" />
                  <Text className={`ml-1 text-xs ${isDark ? 'text-text-muted' : 'text-text-muted'}`}>
                    Cards Due
                  </Text>
                </View>
                <Text className={`text-2xl font-bold ${isDark ? 'text-primary' : 'text-primary-dark'}`}>
                  {cardsDue}
                </Text>
              </View>

              <View className="flex-1 p-3 rounded-lg" style={{ backgroundColor: isDark ? '#1a1a1a' : '#ffffff' }}>
                <View className="flex-row items-center mb-1">
                  <Ionicons name="checkmark-circle-outline" size={16} color="#fbbf24" />
                  <Text className={`ml-1 text-xs ${isDark ? 'text-text-muted' : 'text-text-muted'}`}>
                    Reviewed
                  </Text>
                </View>
                <Text className={`text-2xl font-bold`} style={{ color: '#fbbf24' }}>
                  {todayReviewed}
                </Text>
              </View>

              <View className="flex-1 p-3 rounded-lg" style={{ backgroundColor: isDark ? '#1a1a1a' : '#ffffff' }}>
                <View className="flex-row items-center mb-1">
                  <Ionicons name="flame" size={16} color="#f59e0b" />
                  <Text className={`ml-1 text-xs ${isDark ? 'text-text-muted' : 'text-text-muted'}`}>
                    Streak
                  </Text>
                </View>
                <Text className={`text-2xl font-bold`} style={{ color: '#f59e0b' }}>
                  {streak}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

