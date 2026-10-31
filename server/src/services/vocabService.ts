import { queryOne } from '../config/database';
import { dictionaryAdapter, DictionaryResult } from '../adapters/DictionaryAdapter';

export interface VocabularyRecord extends DictionaryResult {
  id: string;
  source: 'api' | 'manual';
  createdAt: string;
}

interface VocabularyRow {
  id: string;
  word: string;
  meaning_vi: string;
  ipa: string | null;
  example_sentence: string | null;
  source: 'api' | 'manual';
  cached_at: Date;
}

function toRecord(row: VocabularyRow): VocabularyRecord {
  return {
    id: row.id,
    word: row.word,
    meaningVi: row.meaning_vi,
    ipa: row.ipa ?? '',
    example: row.example_sentence ?? '',
    source: row.source,
    createdAt: row.cached_at.toISOString(),
  };
}

export async function lookupWord(word: string): Promise<VocabularyRecord | null> {
  const normalized = word.trim().toLowerCase();
  if (!normalized) return null;

  const cached = await queryOne<VocabularyRow>(
    `SELECT id, word, meaning_vi, ipa, example_sentence, source, cached_at
     FROM vocabularies WHERE word = $1`,
    [normalized],
  );
  if (cached) return toRecord(cached);

  const result = await dictionaryAdapter.lookup(normalized);
  if (!result) return null;

  const saved = await queryOne<VocabularyRow>(
    `INSERT INTO vocabularies (word, meaning_vi, ipa, example_sentence, source)
     VALUES ($1, $2, $3, $4, 'api')
     ON CONFLICT (word) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
     RETURNING id, word, meaning_vi, ipa, example_sentence, source, cached_at`,
    [result.word, result.meaningVi, result.ipa, result.example],
  );
  return saved ? toRecord(saved) : null;
}