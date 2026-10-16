export const COVER_LETTER_TONES = ["professional", "friendly", "concise"] as const;
export type CoverLetterTone = (typeof COVER_LETTER_TONES)[number];

export const COVER_LETTER_LANGUAGES = ["en", "sr"] as const;
export type CoverLetterLanguage = (typeof COVER_LETTER_LANGUAGES)[number];

export const COVER_LETTER_TONE_LABELS: Record<CoverLetterTone, string> = {
  professional: "Professional",
  friendly: "Warm & friendly",
  concise: "Short & direct",
};

export const COVER_LETTER_LANGUAGE_LABELS: Record<CoverLetterLanguage, string> = {
  en: "English",
  sr: "Srpski",
};
