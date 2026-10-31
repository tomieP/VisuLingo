export interface Vocabulary {
  id: string;
  word: string;
  meaningVi: string;
  ipa: string;
  example: string;
  source: 'api' | 'manual';
  createdAt: string;
}

export interface SavedWord {
  id: string;
  word: string;
  meaningVi: string;
  ipa: string;
  example: string;
  imageId?: string;
  savedAt: string;
}