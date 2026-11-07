import { query, queryOne } from '../config/database';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface SavedWordRow {
  id: string;
  vocabulary_id: string;
  word: string;
  meaning_vi: string;
  ipa: string | null;
  example_sentence: string | null;
  image_id: string | null;
  storage_path: string | null;
  saved_at: Date;
}

export interface SavedWordItem {
  id: string;
  vocabularyId: string;
  word: string;
  meaningVi: string;
  ipa: string;
  example: string;
  imageId?: string;
  imageUrl?: string;
  savedAt: string;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function toItem(row: SavedWordRow): SavedWordItem {
  const item: SavedWordItem = {
    id: row.id,
    vocabularyId: row.vocabulary_id,
    word: row.word,
    meaningVi: row.meaning_vi,
    ipa: row.ipa ?? '',
    example: row.example_sentence ?? '',
    savedAt: new Date(row.saved_at).toISOString(),
  };

  if (row.image_id) {
    item.imageId = row.image_id;
  }
  if (row.storage_path) {
    item.imageUrl = row.storage_path;
  }

  return item;
}

function applicationError(message: string, statusCode: number, code: string, retryable = false) {
  return Object.assign(new Error(message), { statusCode, code, retryable });
}

export async function listSavedWords(
  userId: string,
  page: number,
  limit: number,
  q?: string,
): Promise<PaginatedResult<SavedWordItem>> {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), 50);
  const offset = (safePage - 1) * safeLimit;

  let whereClause = 'WHERE sw.user_id = $1';
  const params: any[] = [userId];

  if (q && q.trim()) {
    const searchTerm = `%${q.trim()}%`;
    params.push(searchTerm);
    whereClause += ` AND (v.word ILIKE $${params.length} OR v.meaning_vi ILIKE $${params.length})`;
  }

  const countResult = await queryOne<{ count: string }>(
    `SELECT COUNT(*) as count
     FROM saved_words sw
     JOIN vocabularies v ON sw.vocabulary_id = v.id
     ${whereClause}`,
    params,
  );
  const total = parseInt(countResult?.count ?? '0', 10);

  const dataParams = [...params, safeLimit, offset];
  const rows = await query<SavedWordRow>(
    `SELECT sw.id, sw.vocabulary_id, v.word, v.meaning_vi, v.ipa, v.example_sentence, sw.image_id, i.storage_path, sw.saved_at
     FROM saved_words sw
     JOIN vocabularies v ON sw.vocabulary_id = v.id
     LEFT JOIN images i ON sw.image_id = i.id
     ${whereClause}
     ORDER BY sw.saved_at DESC
     LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
    dataParams,
  );

  return {
    data: rows.map(toItem),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit) || 1,
    },
  };
}

export async function saveWord(
  userId: string,
  vocabularyId?: string,
  word?: string,
  imageId?: string,
): Promise<SavedWordItem> {
  let resolvedVocabId = vocabularyId;

  if (word && !vocabularyId) {
    const normalized = word.trim().toLowerCase();
    const vocab = await queryOne<{ id: string }>('SELECT id FROM vocabularies WHERE lower(word) = $1', [normalized]);
    if (!vocab) {
      throw applicationError('Từ vựng không tìm thấy trong hệ thống', 404, 'VOCAB_NOT_FOUND');
    }
    resolvedVocabId = vocab.id;
  } else if (vocabularyId) {
    if (!UUID_REGEX.test(vocabularyId)) {
      throw applicationError('Từ vựng không tìm thấy trong hệ thống', 404, 'VOCAB_NOT_FOUND');
    }
    const vocabExists = await queryOne<{ id: string }>('SELECT id FROM vocabularies WHERE id = $1', [vocabularyId]);
    if (!vocabExists) {
      throw applicationError('Từ vựng không tìm thấy trong hệ thống', 404, 'VOCAB_NOT_FOUND');
    }
    resolvedVocabId = vocabularyId;
  } else {
    throw applicationError('Yêu cầu vocabularyId hoặc word', 400, 'VALIDATION_ERROR');
  }

  // Anti-Duplicate check
  const duplicate = await queryOne<{ id: string }>(
    'SELECT id FROM saved_words WHERE user_id = $1 AND vocabulary_id = $2',
    [userId, resolvedVocabId],
  );
  if (duplicate) {
    throw applicationError('Từ này đã có trong danh sách từ đã lưu', 409, 'DUPLICATE_WORD', false);
  }

  // Verify optional imageId if provided
  let validImageId: string | null = null;
  if (imageId && UUID_REGEX.test(imageId)) {
    const img = await queryOne<{ id: string }>('SELECT id FROM images WHERE id = $1', [imageId]);
    if (img) {
      validImageId = img.id;
    }
  }

  try {
    const row = await queryOne<SavedWordRow>(
      `INSERT INTO saved_words (user_id, vocabulary_id, image_id)
       VALUES ($1, $2, $3)
       RETURNING id, vocabulary_id,
         (SELECT word FROM vocabularies WHERE id = $2) AS word,
         (SELECT meaning_vi FROM vocabularies WHERE id = $2) AS meaning_vi,
         (SELECT ipa FROM vocabularies WHERE id = $2) AS ipa,
         (SELECT example_sentence FROM vocabularies WHERE id = $2) AS example_sentence,
         image_id,
         (SELECT storage_path FROM images WHERE id = $3) AS storage_path,
         saved_at`,
      [userId, resolvedVocabId, validImageId],
    );

    if (!row) {
      throw applicationError('Không thể lưu từ', 500, 'INTERNAL_ERROR');
    }

    return toItem(row);
  } catch (error: any) {
    if (error?.code === '23505') {
      throw applicationError('Từ này đã có trong danh sách từ đã lưu', 409, 'DUPLICATE_WORD', false);
    }
    throw error;
  }
}

export async function deleteSavedWord(userId: string, savedWordId: string): Promise<void> {
  if (!UUID_REGEX.test(savedWordId)) {
    throw applicationError('Không tìm thấy từ đã lưu', 404, 'SAVED_WORD_NOT_FOUND');
  }

  const row = await queryOne<{ id: string }>(
    'SELECT id FROM saved_words WHERE id = $1 AND user_id = $2',
    [savedWordId, userId],
  );
  if (!row) {
    throw applicationError('Không tìm thấy từ đã lưu', 404, 'SAVED_WORD_NOT_FOUND');
  }

  await queryOne('DELETE FROM saved_words WHERE id = $1 AND user_id = $2', [savedWordId, userId]);
}

export async function isWordSaved(userId: string, vocabularyId?: string, word?: string): Promise<boolean> {
  if (vocabularyId) {
    if (!UUID_REGEX.test(vocabularyId)) return false;
    const row = await queryOne<{ id: string }>(
      'SELECT id FROM saved_words WHERE user_id = $1 AND vocabulary_id = $2',
      [userId, vocabularyId],
    );
    return !!row;
  }
  if (word) {
    const row = await queryOne<{ id: string }>(
      `SELECT sw.id FROM saved_words sw
       JOIN vocabularies v ON sw.vocabulary_id = v.id
       WHERE sw.user_id = $1 AND lower(v.word) = $2`,
      [userId, word.trim().toLowerCase()],
    );
    return !!row;
  }
  return false;
}
