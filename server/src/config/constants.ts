export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

// Bounding box coordinate constraints (normalized 0..1)
export const BBOX = {
  MIN: 0,
  MAX: 1,
} as const;

// Supported image types for upload validation
export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

// Guest storage key on client
export const GUEST_STORAGE_KEY = 'visulingo_saved_words';

// External API endpoints
export const FREE_DICTIONARY_API = 'https://api.dictionaryapi.dev/api/v2/entries/en';

// Database table names
export const TABLES = {
  USERS: 'users',
  IMAGES: 'images',
  DETECTED_OBJECTS: 'detected_objects',
  VOCABULARIES: 'vocabularies',
  SAVED_WORDS: 'saved_words',
  COLLECTIONS: 'collections',
  COLLECTION_IMAGES: 'collection_images',
  ANALYSIS_SESSIONS: 'analysis_sessions',
  LABEL_MAPPINGS: 'label_mappings',
  APP_SETTINGS: 'app_settings',
  USAGE_EVENTS: 'usage_events',
  AUDIT_LOGS: 'audit_logs',
} as const;