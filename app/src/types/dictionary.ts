export interface DictionaryEntry {
  word: string;
  translation: string;
  pronunciation?: string;
  partOfSpeech?: string;
  exampleSentences?: string[];
}

export interface DictionaryResponse {
  entries: DictionaryEntry[];
}

