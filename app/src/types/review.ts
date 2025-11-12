export type DifficultyRating = 'easy' | 'good' | 'hard';

export interface CardProgress {
  id: number;
  card_id: number;
  ease_factor: number;
  interval: number; // days
  last_review?: string;
  next_review: string;
  review_count: number;
  streak: number;
  last_difficulty?: DifficultyRating;
}

export interface ReviewSession {
  card_id: number;
  difficulty: DifficultyRating;
  timestamp: string;
}

