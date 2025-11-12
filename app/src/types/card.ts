export interface Card {
  id: number;
  deck_id: number;
  front: string; // Arabic word
  back: string; // English meaning
  audio_path?: string;
  example_sentence?: string;
  pronunciation?: string;
  created_at: string;
}

export interface CreateCardInput {
  deck_id: number;
  front: string;
  back: string;
  audio_path?: string;
  example_sentence?: string;
  pronunciation?: string;
}

