import { Language } from './types';

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪', speechCode: 'sv-SE' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', speechCode: 'en-US' },
  { code: 'zh', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳', speechCode: 'zh-CN', hasRomanization: true },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文', flag: '🇹🇼', speechCode: 'zh-TW', hasRomanization: true },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', speechCode: 'es-ES' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', speechCode: 'ja-JP', hasRomanization: true },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', speechCode: 'de-DE' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', speechCode: 'fr-FR' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', speechCode: 'ko-KR', hasRomanization: true },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', speechCode: 'it-IT' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', speechCode: 'pt-PT' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', speechCode: 'nl-NL' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', speechCode: 'ru-RU', hasRomanization: true },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', speechCode: 'ar-SA', hasRomanization: true },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴', speechCode: 'no-NO' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰', speechCode: 'da-DK' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮', speechCode: 'fi-FI' },
];

export const PRESET_PHRASES = [
  {
    label: 'Hej, hur mår du?',
    text: 'Hej, hur mår du idag?',
    lang: 'sv',
    category: 'Swedish Daily',
  },
  {
    label: 'Programvaruteknik',
    text: 'Programvaruteknik är en spännande disciplin som kombinerar kreativitet och logik.',
    lang: 'sv',
    category: 'Swedish Tech',
  },
  {
    label: 'Frontend performance',
    text: 'Debounce and throttle are essential techniques to optimize user input and frontend performance.',
    lang: 'en',
    category: 'Software Engineering',
  },
  {
    label: 'Language learning',
    text: 'Lärande av flera språk samtidigt breddar hur man förstår världen.',
    lang: 'sv',
    category: 'Polyglot',
  },
  {
    label: 'Chinese Greeting',
    text: '很高兴认识你，欢迎来到多语言翻译应用！',
    lang: 'zh',
    category: 'Chinese Daily',
  },
  {
    label: 'Swedish proverb',
    text: 'Borta bra men hemma bäst.',
    lang: 'sv',
    category: 'Proverb',
  },
];

export function speakText(text: string, langCode: string) {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser.');
    return;
  }

  window.speechSynthesis.cancel(); // Stop any ongoing speech

  const utterance = new SpeechSynthesisUtterance(text);
  const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === langCode);
  utterance.lang = langObj ? langObj.speechCode : 'en-US';
  utterance.rate = 0.95; // slightly natural tempo

  // Attempt to pick a matching system voice if available
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find((v) => v.lang.toLowerCase().startsWith(langCode.toLowerCase()));
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  window.speechSynthesis.speak(utterance);
}
