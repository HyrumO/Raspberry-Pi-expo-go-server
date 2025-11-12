import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useState, useEffect } from 'react';
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
        return;
      }

      Alert.alert('Importing...', 'Please wait while we import your Anki deck.');
      const deckId = await importAnkiDeck(fileUri);

      if (deckId) {
        Alert.alert('Success', 'Anki deck imported successfully!');
        await loadDecks();
      } else {
        Alert.alert('Error', 'Failed to import Anki deck. Please try again.');
      }
    } catch (error) {
      console.error('Error importing deck:', error);
      Alert.alert('Error', 'An error occurred while importing the deck.');
    }
  };

  return (
    <View className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background-light'}`}>
      <ScrollView className="flex-1 p-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className={`text-2xl font-bold ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
            My Decks
          </Text>
          <TouchableOpacity
            onPress={handleImport}
            className="bg-primary px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-semibold">Import Anki</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <Text className={isDark ? 'text-text-muted' : 'text-text-muted'}>Loading...</Text>
        ) : decks.length === 0 ? (
          <Text className={isDark ? 'text-text-muted' : 'text-text-muted'}>
            No decks yet. Import an Anki deck to get started!
          </Text>
        ) : (
          decks.map((deck) => (
            <DeckCard key={deck.id} deck={deck} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

