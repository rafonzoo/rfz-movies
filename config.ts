export const defaultLocale = 'id-ID'

export const [defaultLanguage, defaultRegion] = defaultLocale.split('-')

export const TOP_10_STREAM_PROVIDER_IDS = [
  8, // Netflix
  119, // Amazon Prime Video
  122, // Disney+ (Hotstar)
  1899, // Max
  350, // Apple TV+
] as const

export const TOP_10_WATCH_PROVIDER_IDS = [
  2, // Apple TV
  3, // Google Play Movies
  68, // Microsoft Store
  7, // Fandango At Home
  483, // Max Stream
  576, // KlikFilm
]

export const nonLatinLanguages = new Set([
  // East Asia
  'zh', // Chinese (Simplified & Traditional)
  'ja', // Japanese
  'ko', // Korean

  // South Asia
  'hi', // Hindi
  'bn', // Bengali
  'ta', // Tamil
  'te', // Telugu
  'mr', // Marathi
  'ur', // Urdu
  'pa', // Punjabi
  'gu', // Gujarati
  'kn', // Kannada
  'ml', // Malayalam
  'si', // Sinhala
  'ne', // Nepali

  // Middle East & Central Asia
  'ar', // Arabic
  'fa', // Persian (Farsi)
  'ps', // Pashto

  // Southeast Asia
  'th', // Thai
  'lo', // Lao
  'km', // Khmer
  'my', // Burmese

  // Cyrillic-based
  'ru', // Russian
  'uk', // Ukrainian
  'be', // Belarusian
  'bg', // Bulgarian
  'sr', // Serbian (Cyrillic)
  'mk', // Macedonian
  'mn', // Mongolian (Cyrillic)
  'kk', // Kazakh
])
