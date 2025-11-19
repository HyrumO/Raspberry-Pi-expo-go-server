import { View, Text, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { getDailyStats, getCardsDueForReview } from '../services/database';
import { config } from '../constants/config';

export default function StatsScreen() {
  const { isDark } = useTheme();
  const [stats, setStats] = useState({
    totalReviewed: 0,
    totalCorrect: 0,
    streak: 0,
    dailyGoal: config.goals.defaultDailyCards,
    todayReviewed: 0,
    cardsDue: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [dailyStats, dueCards] = await Promise.all([
        getDailyStats(30),
        getCardsDueForReview(1000),
      ]);

      const totalReviewed = dailyStats.reduce((sum, stat) => sum + (stat.cards_reviewed || 0), 0);
      const totalCorrect = dailyStats.reduce((sum, stat) => sum + (stat.cards_correct || 0), 0);
      
      // Get today's stats
      const today = new Date().toISOString().split('T')[0];
      const todayStat = dailyStats.find((stat: any) => stat.date === today);
      const todayReviewed = todayStat?.cards_reviewed || 0;
      
      // Calculate streak (consecutive days with reviews)
      let streak = 0;
      const todayDate = new Date();
      for (let i = 0; i < 365; i++) {
        const date = new Date(todayDate);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayStat = dailyStats.find((s: any) => s.date === dateStr);
        if (dayStat && dayStat.cards_reviewed > 0) {
          streak++;
        } else if (i > 0) {
          break;
        }
      }

      setStats({
        totalReviewed,
        totalCorrect,
        streak,
        dailyGoal: config.goals.defaultDailyCards,
        todayReviewed,
        cardsDue: dueCards.length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const accuracy = stats.totalReviewed > 0 
    ? Math.round((stats.totalCorrect / stats.totalReviewed) * 100) 
    : 0;

  const dailyGoalProgress = Math.min((stats.todayReviewed / stats.dailyGoal) * 100, 100);

  // Get last 7 days for chart
  const last7Days = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    last7Days.push(date.toISOString().split('T')[0]);
  }

  return (
    <View className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background-light'}`}>
      <ScrollView className="flex-1 p-4">
        <Text className={`text-3xl font-bold mb-6 ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
          Statistics
        </Text>
        
        {/* Total Cards Studied */}
        <View className={`p-5 rounded-xl mb-4 ${isDark ? 'bg-surface-dark' : 'bg-surface-light'}`}>
          <View className="flex-row items-center mb-3">
            <Ionicons name="trophy" size={24} color="#14b8a6" />
            <Text className={`ml-2 text-lg font-semibold ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
              Total Cards Studied
            </Text>
          </View>
          <Text className={`text-4xl font-bold mb-2 ${isDark ? 'text-primary' : 'text-primary-dark'}`}>
            {stats.totalReviewed}
          </Text>
          <Text className={`text-sm ${isDark ? 'text-text-muted' : 'text-text-muted'}`}>
            Cards reviewed in the last 30 days
          </Text>
        </View>

        {/* Accuracy */}
        <View className={`p-5 rounded-xl mb-4 ${isDark ? 'bg-surface-dark' : 'bg-surface-light'}`}>
          <View className="flex-row items-center mb-3">
            <Ionicons name="checkmark-circle" size={24} color="#14b8a6" />
            <Text className={`ml-2 text-lg font-semibold ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
              Accuracy
            </Text>
          </View>
          <View className="mb-3">
            <Text className={`text-4xl font-bold mb-2 ${isDark ? 'text-primary' : 'text-primary-dark'}`}>
              {accuracy}%
            </Text>
            <View className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-background-dark' : 'bg-gray-200'}`}>
              <View
                className="h-full bg-primary rounded-full"
                style={{ width: `${accuracy}%` }}
              />
            </View>
          </View>
          <Text className={`text-sm ${isDark ? 'text-text-muted' : 'text-text-muted'}`}>
            {stats.totalCorrect} correct out of {stats.totalReviewed} reviewed
          </Text>
        </View>

        {/* Daily Streak */}
        <View className={`p-5 rounded-xl mb-4 ${isDark ? 'bg-surface-dark' : 'bg-surface-light'}`}>
          <View className="flex-row items-center mb-3">
            <Ionicons name="flame" size={24} color="#fbbf24" />
            <Text className={`ml-2 text-lg font-semibold ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
              Daily Streak
            </Text>
          </View>
          <Text className={`text-4xl font-bold mb-2`} style={{ color: '#fbbf24' }}>
            {stats.streak}
          </Text>
          <Text className={`text-sm ${isDark ? 'text-text-muted' : 'text-text-muted'}`}>
            Consecutive days with reviews
          </Text>
        </View>

        {/* Daily Goal */}
        <View className={`p-5 rounded-xl mb-4 ${isDark ? 'bg-surface-dark' : 'bg-surface-light'}`}>
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Ionicons name="calendar" size={24} color="#14b8a6" />
              <Text className={`ml-2 text-lg font-semibold ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
                Daily Goal
              </Text>
            </View>
            <Text className={`text-sm font-semibold ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
              {stats.todayReviewed} / {stats.dailyGoal}
            </Text>
          </View>
          <View className={`h-3 rounded-full overflow-hidden mb-2 ${isDark ? 'bg-background-dark' : 'bg-gray-200'}`}>
            <View
              className="h-full bg-primary rounded-full"
              style={{ width: `${dailyGoalProgress}%` }}
            />
          </View>
          <Text className={`text-sm ${isDark ? 'text-text-muted' : 'text-text-muted'}`}>
            {stats.dailyGoal} cards per day target
          </Text>
        </View>

        {/* Cards Due */}
        <View className={`p-5 rounded-xl mb-4 ${isDark ? 'bg-surface-dark' : 'bg-surface-light'}`}>
          <View className="flex-row items-center mb-3">
            <Ionicons name="time" size={24} color="#14b8a6" />
            <Text className={`ml-2 text-lg font-semibold ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
              Cards Due
            </Text>
          </View>
          <Text className={`text-4xl font-bold mb-2 ${isDark ? 'text-primary' : 'text-primary-dark'}`}>
            {stats.cardsDue}
          </Text>
          <Text className={`text-sm ${isDark ? 'text-text-muted' : 'text-text-muted'}`}>
            Cards ready for review
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

