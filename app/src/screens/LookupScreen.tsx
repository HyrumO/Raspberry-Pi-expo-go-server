import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { DictionaryEntry } from '../types/dictionary';
import { lookupWord } from '../services/dictionary';

export default function LookupScreen() {
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [result, setResult] = useState<DictionaryEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const entry = await lookupWord(searchQuery.trim());
      setResult(entry);
    } catch (error) {
      console.error('Error looking up word:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background-light'}`}>
      <ScrollView className="flex-1 p-4">
        <View className="flex-row items-center mb-6">
          <Ionicons name="search" size={28} color="#14b8a6" />
          <Text className={`ml-2 text-3xl font-bold ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
            Word Lookup
          </Text>
        </View>
        <View className="flex-row mb-4">
          <View className={`flex-1 flex-row items-center p-4 rounded-xl mr-2 ${isDark ? 'bg-surface-dark' : 'bg-surface-light'}`}>
            <Ionicons name="search-outline" size={20} color={isDark ? '#9ca3af' : '#6b7280'} style={{ marginRight: 8 }} />
            <TextInput
              className={`flex-1 ${isDark ? 'text-text-dark' : 'text-text-light'}`}
              placeholder="Search for a word..."
              placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
          </View>
          <TouchableOpacity
            onPress={handleSearch}
            className="bg-primary px-6 py-4 rounded-xl justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Ionicons name="arrow-forward" size={24} color="white" />
            )}
          </TouchableOpacity>
        </View>

        {result ? (
          <View className={`p-5 rounded-xl ${isDark ? 'bg-surface-dark' : 'bg-surface-light'}`} style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDark ? 0.1 : 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}>
            <View className="flex-row items-center mb-3">
              <Ionicons name="book" size={24} color="#14b8a6" />
              <Text className={`ml-2 text-2xl font-bold ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
                {result.word}
              </Text>
            </View>
            {result.pronunciation && (
              <View className="flex-row items-center mb-3">
                <Ionicons name="volume-high" size={18} color={isDark ? '#9ca3af' : '#6b7280'} />
                <Text className={`ml-2 text-lg ${isDark ? 'text-text-muted' : 'text-text-muted'}`}>
                  {result.pronunciation}
                </Text>
              </View>
            )}
            <View className="mb-3">
              <Text className={`text-xl font-semibold ${isDark ? 'text-primary' : 'text-primary-dark'}`}>
                {result.translation}
              </Text>
            </View>
            {result.partOfSpeech && (
              <View className="flex-row items-center mb-4">
                <Ionicons name="pricetag" size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
                <Text className={`ml-2 text-sm ${isDark ? 'text-text-muted' : 'text-text-muted'}`}>
                  {result.partOfSpeech}
                </Text>
              </View>
            )}
            {result.exampleSentences && result.exampleSentences.length > 0 && (
              <View className="mt-4">
                <View className="flex-row items-center mb-3">
                  <Ionicons name="chatbubbles" size={18} color={isDark ? '#9ca3af' : '#6b7280'} />
                  <Text className={`ml-2 font-semibold ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
                    Examples:
                  </Text>
                </View>
                {result.exampleSentences.map((sentence, index) => (
                  <View key={index} className={`mb-2 p-3 rounded-lg ${isDark ? 'bg-background-dark' : 'bg-gray-100'}`}>
                    <Text className={`${isDark ? 'text-text-muted' : 'text-text-muted'}`}>
                      {sentence}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : searchQuery === '' ? (
          <View className={`p-8 rounded-xl items-center ${isDark ? 'bg-surface-dark' : 'bg-surface-light'}`}>
            <Ionicons name="search-outline" size={64} color={isDark ? '#9ca3af' : '#6b7280'} />
            <Text className={`text-center text-base mt-4 ${isDark ? 'text-text-muted' : 'text-text-muted'}`}>
              Enter an Arabic word to search for its translation and meaning.
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

