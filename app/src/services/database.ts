import * as SQLite from 'expo-sqlite';
import { Deck, CreateDeckInput } from '../types/deck';
import { Card, CreateCardInput } from '../types/card';
import { CardProgress, DifficultyRating } from '../types/review';

let db: SQLite.SQLiteDatabase | null = null;

export async function initDatabase(): Promise<void> {
  try {
    db = await SQLite.openDatabaseAsync('arabic_learning.db');
    
    // Create decks table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS decks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        card_count INTEGER DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    // Create cards table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        deck_id INTEGER NOT NULL,
        front TEXT NOT NULL,
        back TEXT NOT NULL,
        audio_path TEXT,
        example_sentence TEXT,
        pronunciation TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE
      );
    `);

    // Create card_progress table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS card_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        card_id INTEGER NOT NULL UNIQUE,
        ease_factor REAL DEFAULT 2.5,
        interval INTEGER DEFAULT 1,
        last_review TEXT,
        next_review TEXT NOT NULL DEFAULT (date('now')),
        review_count INTEGER DEFAULT 0,
        streak INTEGER DEFAULT 0,
        last_difficulty TEXT,
        FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
      );
    `);

    // Create daily_stats table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS daily_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL UNIQUE DEFAULT (date('now')),
        cards_reviewed INTEGER DEFAULT 0,
        cards_correct INTEGER DEFAULT 0,
        cards_incorrect INTEGER DEFAULT 0,
        study_time_minutes INTEGER DEFAULT 0
      );
    `);

    // Create lookup_cache table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS lookup_cache (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        word TEXT NOT NULL UNIQUE,
        translation TEXT NOT NULL,
        pronunciation TEXT,
        part_of_speech TEXT,
        example_sentences TEXT,
        cached_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    // Create indexes
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_cards_deck_id ON cards(deck_id);
      CREATE INDEX IF NOT EXISTS idx_card_progress_card_id ON card_progress(card_id);
      CREATE INDEX IF NOT EXISTS idx_card_progress_next_review ON card_progress(next_review);
    `);
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Deck operations
export async function createDeck(input: CreateDeckInput): Promise<number> {
  if (!db) throw new Error('Database not initialized');
  if (!input.name || input.name.trim().length === 0) {
    throw new Error('Deck name is required');
  }
  
  const result = await db.runAsync(
    'INSERT INTO decks (name, description) VALUES (?, ?)',
    [input.name.trim(), input.description?.trim() || null]
  );
  return result.lastInsertRowId;
}

export async function getDecks(): Promise<Deck[]> {
  if (!db) throw new Error('Database not initialized');
  
  const result = await db.getAllAsync<Deck>('SELECT * FROM decks ORDER BY created_at DESC');
  return result;
}

export async function getDeckById(id: number): Promise<Deck | null> {
  if (!db) throw new Error('Database not initialized');
  if (!id || id <= 0) throw new Error('Invalid deck ID');
  
  const result = await db.getFirstAsync<Deck>('SELECT * FROM decks WHERE id = ?', [id]);
  return result || null;
}

export async function deleteDeck(id: number): Promise<void> {
  if (!db) throw new Error('Database not initialized');
  if (!id || id <= 0) throw new Error('Invalid deck ID');
  
  // Verify deck exists
  const deck = await getDeckById(id);
  if (!deck) {
    throw new Error('Deck not found');
  }
  
  await db.runAsync('DELETE FROM decks WHERE id = ?', [id]);
}

// Card operations
export async function createCard(input: CreateCardInput): Promise<number> {
  if (!db) throw new Error('Database not initialized');
  if (!input.deck_id || input.deck_id <= 0) throw new Error('Invalid deck ID');
  if (!input.front || input.front.trim().length === 0) {
    throw new Error('Card front text is required');
  }
  if (!input.back || input.back.trim().length === 0) {
    throw new Error('Card back text is required');
  }
  
  // Verify deck exists
  const deck = await getDeckById(input.deck_id);
  if (!deck) {
    throw new Error('Deck not found');
  }
  
  const result = await db.runAsync(
    `INSERT INTO cards (deck_id, front, back, audio_path, example_sentence, pronunciation)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      input.deck_id,
      input.front.trim(),
      input.back.trim(),
      input.audio_path?.trim() || null,
      input.example_sentence?.trim() || null,
      input.pronunciation?.trim() || null,
    ]
  );
  
  // Update deck card count
  await db.runAsync(
    'UPDATE decks SET card_count = card_count + 1, updated_at = datetime("now") WHERE id = ?',
    [input.deck_id]
  );
  
  // Initialize card progress
  await db.runAsync(
    `INSERT INTO card_progress (card_id, next_review)
     VALUES (?, date('now'))`,
    [result.lastInsertRowId]
  );
  
  return result.lastInsertRowId;
}

export async function getCardsByDeck(deckId: number): Promise<Card[]> {
  if (!db) throw new Error('Database not initialized');
  if (!deckId || deckId <= 0) throw new Error('Invalid deck ID');
  
  const result = await db.getAllAsync<Card>(
    'SELECT * FROM cards WHERE deck_id = ? ORDER BY created_at DESC',
    [deckId]
  );
  return result;
}

export async function getCardById(id: number): Promise<Card | null> {
  if (!db) throw new Error('Database not initialized');
  if (!id || id <= 0) throw new Error('Invalid card ID');
  
  const result = await db.getFirstAsync<Card>('SELECT * FROM cards WHERE id = ?', [id]);
  return result || null;
}

export async function deleteCard(id: number): Promise<void> {
  if (!db) throw new Error('Database not initialized');
  if (!id || id <= 0) throw new Error('Invalid card ID');
  
  // Get the card to find its deck_id before deletion
  const card = await getCardById(id);
  if (!card) {
    throw new Error('Card not found');
  }
  
  // Delete the card (card_progress will be deleted via CASCADE)
  await db.runAsync('DELETE FROM cards WHERE id = ?', [id]);
  
  // Update deck card count
  await db.runAsync(
    'UPDATE decks SET card_count = GREATEST(0, card_count - 1), updated_at = datetime("now") WHERE id = ?',
    [card.deck_id]
  );
}

// Card progress operations
export async function getCardProgress(cardId: number): Promise<CardProgress | null> {
  if (!db) throw new Error('Database not initialized');
  if (!cardId || cardId <= 0) throw new Error('Invalid card ID');
  
  const result = await db.getFirstAsync<CardProgress>(
    'SELECT * FROM card_progress WHERE card_id = ?',
    [cardId]
  );
  return result || null;
}

export async function getCardsDueForReview(limit: number = 20): Promise<Card[]> {
  if (!db) throw new Error('Database not initialized');
  if (limit <= 0 || limit > 1000) {
    throw new Error('Limit must be between 1 and 1000');
  }
  
  const result = await db.getAllAsync<Card>(
    `SELECT c.* FROM cards c
     INNER JOIN card_progress cp ON c.id = cp.card_id
     WHERE cp.next_review <= date('now')
     ORDER BY cp.next_review ASC
     LIMIT ?`,
    [limit]
  );
  return result;
}

export async function updateCardProgress(
  cardId: number,
  difficulty: DifficultyRating,
  newEaseFactor: number,
  newInterval: number
): Promise<void> {
  if (!db) throw new Error('Database not initialized');
  if (!cardId || cardId <= 0) throw new Error('Invalid card ID');
  if (newEaseFactor < 0) throw new Error('Ease factor must be non-negative');
  if (newInterval < 0) throw new Error('Interval must be non-negative');
  
  await db.runAsync(
    `UPDATE card_progress
     SET ease_factor = ?,
         interval = ?,
         last_review = datetime('now'),
         next_review = date('now', '+' || ? || ' days'),
         review_count = review_count + 1,
         streak = CASE WHEN last_difficulty = ? THEN streak + 1 ELSE 1 END,
         last_difficulty = ?
     WHERE card_id = ?`,
    [newEaseFactor, newInterval, newInterval, difficulty, difficulty, cardId]
  );
}

// Daily stats operations
export async function updateDailyStats(
  cardsReviewed: number,
  cardsCorrect: number,
  cardsIncorrect: number
): Promise<void> {
  if (!db) throw new Error('Database not initialized');
  if (cardsReviewed < 0 || cardsCorrect < 0 || cardsIncorrect < 0) {
    throw new Error('Stats values must be non-negative');
  }
  if (cardsCorrect + cardsIncorrect > cardsReviewed) {
    throw new Error('Correct + incorrect cards cannot exceed total reviewed');
  }
  
  const today = new Date().toISOString().split('T')[0];
  
  await db.runAsync(
    `INSERT INTO daily_stats (date, cards_reviewed, cards_correct, cards_incorrect)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(date) DO UPDATE SET
       cards_reviewed = cards_reviewed + ?,
       cards_correct = cards_correct + ?,
       cards_incorrect = cards_incorrect + ?`,
    [today, cardsReviewed, cardsCorrect, cardsIncorrect, cardsReviewed, cardsCorrect, cardsIncorrect]
  );
}

export async function getDailyStats(days: number = 30): Promise<any[]> {
  if (!db) throw new Error('Database not initialized');
  if (days <= 0 || days > 365) {
    throw new Error('Days must be between 1 and 365');
  }
  
  const result = await db.getAllAsync(
    `SELECT * FROM daily_stats
     WHERE date >= date('now', '-' || ? || ' days')
     ORDER BY date DESC`,
    [days]
  );
  return result;
}

