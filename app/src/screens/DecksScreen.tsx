import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { DeckCard } from '../components/DeckCard';
import { Deck } from '../types/deck';
import { getDecks } from '../services/database';
import { pickAnkiFile, importAnkiDeck } from '../services/ankiParser';

export default function DecksScreen() {
  const { isDark } = useTheme();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDecks();
  }, []);

  const loadDecks = async () => {
    try {
      setIsLoading(true);
      const allDecks = await getDecks();
      setDecks(allDecks);
    } catch (error) {
      console.error('Error loading decks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    try {
      const fileUri = await pickAnkiFile();
      if (!fileUri) {
        // User canceled file selection - this is fine, no need to show error
        return;
      }

      // Show loading alert
      Alert.alert('Importing...', 'Please wait while we import your Anki deck.');
      
      const deckId = await importAnkiDeck(fileUri);

      if (deckId) {
        Alert.alert('Success', 'Anki deck imported successfully!');
        await loadDecks();
      } else {
        Alert.alert(
          'Import Failed', 
          'Failed to import Anki deck. Please make sure the file is a valid .apkg file and try again.'
        );
      }
    } catch (error) {
      console.error('Error importing deck:', error);
      Alert.alert(
        'Error', 
        'An error occurred while importing the deck. Please check that the file is a valid Anki deck (.apkg) file.'
      );
    }
  };

  return (
    <View className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background-light'}`}>
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row justify-between items-center mb-6 mt-2">
          <View className="flex-row items-center">
            <Ionicons name="folder" size={24} color="#14b8a6" />
            <Text className={`ml-2 text-2xl font-bold ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
              My Decks
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleImport}
            className="bg-primary px-4 py-2 rounded-lg flex-row items-center"
          >
            <Ionicons name="download" size={18} color="white" />
            <Text className="text-white font-semibold ml-2">Import</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View className="items-center justify-center py-12">
            <ActivityIndicator size="large" color="#14b8a6" />
            <Text className={`mt-4 ${isDark ? 'text-text-muted' : 'text-text-muted'}`}>
              Loading decks...
            </Text>
          </View>
        ) : decks.length === 0 ? (
          <View className={`p-8 rounded-xl items-center ${isDark ? 'bg-surface-dark' : 'bg-surface-light'}`}>
            <Ionicons name="folder-open-outline" size={64} color={isDark ? '#9ca3af' : '#6b7280'} />
            <Text className={`text-xl font-semibold mt-4 mb-2 ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
              No Decks Yet
            </Text>
            <Text className={`text-center text-sm mb-6 ${isDark ? 'text-text-muted' : 'text-text-muted'}`}>
              Import an Anki deck file (.apkg) to start learning Arabic vocabulary with spaced repetition!
            </Text>
            <TouchableOpacity
              onPress={handleImport}
              className="bg-primary px-6 py-3 rounded-lg flex-row items-center"
            >
              <Ionicons name="download" size={20} color="white" />
              <Text className="text-white font-semibold ml-2">Import Anki Deck</Text>
            </TouchableOpacity>
          </View>
        ) : (
          decks.map((deck) => (
            <DeckCard key={deck.id} deck={deck} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

