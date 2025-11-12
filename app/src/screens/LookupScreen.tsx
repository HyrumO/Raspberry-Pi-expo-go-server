import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState } from 'react';
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
        <Text className={`text-2xl font-bold mb-4 ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
          Word Lookup
        </Text>
        <View className="flex-row mb-4">
          <TextInput
            className={`flex-1 p-4 rounded-lg mr-2 ${isDark ? 'bg-surface-dark text-text-dark' : 'bg-surface-light text-text-light'}`}
            placeholder="Search for a word..."
            placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity
            onPress={handleSearch}
            className="bg-primary px-6 py-4 rounded-lg justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold">Search</Text>
            )}
          </TouchableOpacity>
        </View>

        {result ? (
          <View className={`p-4 rounded-lg ${isDark ? 'bg-surface-dark' : 'bg-surface-light'}`}>
            <Text className={`text-2xl font-bold mb-2 ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
              {result.word}
            </Text>
            {result.pronunciation && (
              <Text className={`text-lg mb-2 ${isDark ? 'text-text-muted' : 'text-text-muted'}`}>
                {result.pronunciation}
              </Text>
            )}
            <Text className={`text-xl font-semibold mb-2 ${isDark ? 'text-primary' : 'text-primary-dark'}`}>
              {result.translation}
            </Text>
            {result.partOfSpeech && (
              <Text className={`text-sm mb-2 ${isDark ? 'text-text-muted' : 'text-text-muted'}`}>
                {result.partOfSpeech}
              </Text>
            )}
            {result.exampleSentences && result.exampleSentences.length > 0 && (
              <View className="mt-4">
                <Text className={`font-semibold mb-2 ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
                  Examples:
                </Text>
                {result.exampleSentences.map((sentence, index) => (
                  <Text key={index} className={`mb-1 ${isDark ? 'text-text-muted' : 'text-text-muted'}`}>
                    • {sentence}
                  </Text>
                ))}
              </View>
            )}
          </View>
        ) : searchQuery === '' ? (
          <Text className={isDark ? 'text-text-muted' : 'text-text-muted'}>
            Enter a word to search for its translation and meaning.
          </Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

