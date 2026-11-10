export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  speechCode: string;
  hasRomanization?: boolean;
}

export interface VocabularyItem {
  original: string;
  translated: string;
  partOfSpeech?: string;
  note?: string;
}

export interface TranslationResult {
  targetLang: string;
  targetLangName: string;
  translatedText: string;
  romanization?: string;
  alternatives?: string[];
  vocabulary?: VocabularyItem[];
  linguisticNote?: string;
}

export interface TranslationResponse {
  detectedSourceLang?: string;
  results: TranslationResult[];
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  sourceLang: string;
  sourceText: string;
  targets: {
    lang: string;
    langName: string;
    text: string;
    romanization?: string;
  }[];
}

export type TranslationTone = 'natural' | 'conversational' | 'formal' | 'technical' | 'creative';
