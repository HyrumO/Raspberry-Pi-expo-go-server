export interface Deck {
  id: number;
  name: string;
  description?: string;
  card_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateDeckInput {
  name: string;
  description?: string;
}

