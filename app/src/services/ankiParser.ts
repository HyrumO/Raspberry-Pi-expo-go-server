import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import JSZip from 'jszip';
import { createDeck, createCard } from './database';
import { CreateCardInput } from '../types/card';

export interface AnkiDeckData {
  name: string;
  cards: CreateCardInput[];
}

export async function pickAnkiFile(): Promise<string | null> {
  try {
    // Support both .apkg files and zip files
    // .apkg files are ZIP archives, so we accept both MIME types
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/zip', 'application/x-zip-compressed', '*/*'],
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const fileUri = result.assets[0].uri;
    const fileName = result.assets[0].name || '';
    
    // Verify it's an Anki deck file (.apkg) or zip file
    if (!fileName.toLowerCase().endsWith('.apkg') && 
        !fileName.toLowerCase().endsWith('.zip')) {
      console.warn('Selected file may not be an Anki deck. Expected .apkg or .zip file.');
      // Still proceed - the file might be valid even without the extension
    }

    return fileUri;
  } catch (error) {
    console.error('Error picking file:', error);
    return null;
  }
}

export async function parseAnkiFile(fileUri: string): Promise<AnkiDeckData | null> {
  try {
    // Read the file
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: 'base64',
    });

    // Convert base64 to binary
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Parse ZIP
    const zip = await JSZip.loadAsync(bytes);
    
    // Extract collection.anki2 (SQLite database)
    const collectionFile = zip.file('collection.anki2');
    if (!collectionFile) {
      throw new Error('Not a valid Anki deck file');
    }

    // For now, return a basic structure
    // Full Anki parsing would require parsing the SQLite database
    // This is a simplified version - you may need to use a library like 'anki-apkg-export'
    // or implement full SQLite parsing
    
    const deckName = 'Imported Anki Deck';
    const cards: CreateCardInput[] = [];

    // TODO: Implement full Anki deck parsing
    // This would involve:
    // 1. Extracting and parsing the SQLite database
    // 2. Reading card templates and fields
    // 3. Extracting media files
    // 4. Converting to app's card format

    return {
      name: deckName,
      cards,
    };
  } catch (error) {
    console.error('Error parsing Anki file:', error);
    return null;
  }
}

export async function importAnkiDeck(fileUri: string): Promise<number | null> {
  try {
    const deckData = await parseAnkiFile(fileUri);
    if (!deckData) {
      return null;
    }

    // Create deck
    const deckId = await createDeck({
      name: deckData.name,
    });

    // Create cards
    for (const cardInput of deckData.cards) {
      await createCard({
        ...cardInput,
        deck_id: deckId,
      });
    }

    return deckId;
  } catch (error) {
    console.error('Error importing Anki deck:', error);
    return null;
  }
}

