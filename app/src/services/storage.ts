import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Paths, File } from 'expo-file-system';
import { DictionaryEntry } from '../types/dictionary';
import { Deck } from '../types/deck';
import { Card } from '../types/card';
import { getDecks, getCardsByDeck } from './database';

const LOOKUP_CACHE_KEY = '@lookup_cache_';

export async function lookupCache(word: string): Promise<DictionaryEntry | null> {
  try {
    const cached = await AsyncStorage.getItem(LOOKUP_CACHE_KEY + word.toLowerCase());
    if (cached) {
      return JSON.parse(cached);
    }
    return null;
  } catch (error) {
    console.error('Error reading lookup cache:', error);
    return null;
  }
}

export async function saveLookupCache(entry: DictionaryEntry): Promise<void> {
  try {
    await AsyncStorage.setItem(
      LOOKUP_CACHE_KEY + entry.word.toLowerCase(),
      JSON.stringify(entry)
    );
  } catch (error) {
    console.error('Error saving lookup cache:', error);
  }
}

export interface BackupData {
  decks: Deck[];
  cards: { [deckId: number]: Card[] };
  timestamp: string;
}

export async function exportBackup(): Promise<string | null> {
  try {
    const decks = await getDecks();
    const cards: { [deckId: number]: Card[] } = {};

    for (const deck of decks) {
      cards[deck.id] = await getCardsByDeck(deck.id);
    }

    const backup: BackupData = {
      decks,
      cards,
      timestamp: new Date().toISOString(),
    };

    const json = JSON.stringify(backup, null, 2);
    // Create a temporary file in cache directory
    const file = new File(Paths.cache, `backup_${Date.now()}.json`);
    const writer = await file.writableStream().getWriter();
    const encoder = new TextEncoder();
    await writer.write(encoder.encode(json));
    await writer.close();
    return file.uri;
  } catch (error) {
    console.error('Error exporting backup:', error);
    return null;
  }
}

export async function importBackup(fileUri: string): Promise<boolean> {
  try {
    const json = await FileSystem.readAsStringAsync(fileUri);
    const backup: BackupData = JSON.parse(json);

    // TODO: Implement import logic
    // This would involve creating decks and cards from the backup data

    return true;
  } catch (error) {
    console.error('Error importing backup:', error);
    return false;
  }
}

