import { View, Text, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { getDailyStats } from '../services/database';
import { config } from '../constants/config';

export default function StatsScreen() {
  const { isDark } = useTheme();
  const [stats, setStats] = useState({
    totalReviewed: 0,
    totalCorrect: 0,
    streak: 0,
    dailyGoal: config.goals.defaultDailyCards,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const dailyStats = await getDailyStats(30);
      const totalReviewed = dailyStats.reduce((sum, stat) => sum + (stat.cards_reviewed || 0), 0);
      const totalCorrect = dailyStats.reduce((sum, stat) => sum + (stat.cards_correct || 0), 0);
      
      // Calculate streak (consecutive days with reviews)
      let streak = 0;
      const today = new Date();
      for (let i = 0; i < 365; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayStat = dailyStats.find(s => s.date === dateStr);
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
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const accuracy = stats.totalReviewed > 0 
    ? Math.round((stats.totalCorrect / stats.totalReviewed) * 100) 
    : 0;

  return (
    <View className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background-light'}`}>
      <ScrollView className="flex-1 p-4">
        <Text className={`text-2xl font-bold mb-4 ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
          Statistics
        </Text>
        
        <View className={`p-4 rounded-lg mb-4 ${isDark ? 'bg-surface-dark' : 'bg-surface-light'}`}>
          <Text className={`text-lg font-semibold mb-2 ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
            Total Cards Studied
          </Text>
          <Text className={`text-3xl font-bold ${isDark ? 'text-primary' : 'text-primary-dark'}`}>
            {stats.totalReviewed}
          </Text>
        </View>

        <View className={`p-4 rounded-lg mb-4 ${isDark ? 'bg-surface-dark' : 'bg-surface-light'}`}>
          <Text className={`text-lg font-semibold mb-2 ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
            Accuracy
          </Text>
          <Text className={`text-3xl font-bold ${isDark ? 'text-primary' : 'text-primary-dark'}`}>
            {accuracy}%
          </Text>
        </View>

        <View className={`p-4 rounded-lg mb-4 ${isDark ? 'bg-surface-dark' : 'bg-surface-light'}`}>
          <Text className={`text-lg font-semibold mb-2 ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
            Daily Streak
          </Text>
          <Text className={`text-3xl font-bold ${isDark ? 'text-accent' : 'text-accent-dark'}`}>
            {stats.streak} days
          </Text>
        </View>

        <View className={`p-4 rounded-lg mb-4 ${isDark ? 'bg-surface-dark' : 'bg-surface-light'}`}>
          <Text className={`text-lg font-semibold mb-2 ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
            Daily Goal
          </Text>
          <Text className={`text-xl font-bold ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
            {stats.dailyGoal} cards/day
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

