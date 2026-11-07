import { query, queryOne } from '../config/database';
import { cloudinaryAdapter } from '../adapters/CloudinaryAdapter';
import logger from '../utils/logger';
import fs from 'node:fs';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function applicationError(message: string, statusCode: number, code: string, retryable = false) {
  return Object.assign(new Error(message), { statusCode, code, retryable });
}

export interface CollectionSummary {
  id: string;
  name: string;
  theme?: string | null;
  description?: string | null;
  coverImageId?: string | null;
  coverImageUrl?: string | null;
  imageCount: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionImageItem {
  id: string;
  originalFilename: string;
  storagePath: string;
  thumbnailPath?: string | null;
  mimeType: string;
  fileSizeBytes: number;
  widthPx?: number | null;
  heightPx?: number | null;
  addedAt: string;
  detectedObjects: Array<{
    id: string;
    label: string;
    confidence: number;
    bbox: { x: number; y: number; w: number; h: number };
  }>;
}

export interface CollectionDetail extends CollectionSummary {
  images: CollectionImageItem[];
}

export interface VocabularyAggregateItem {
  word: string;
  meaningVi: string | null;
  ipa: string | null;
  example: string | null;
  occurrences: number;
  vocabularyId?: string | null;
}

export interface CollectionVocabularyResult {
  collectionId: string;
  totalWords: number;
  uniqueWords: number;
  words: VocabularyAggregateItem[];
}

/**
 * 1. GET /api/collections
 * Trả về danh sách bộ sưu tập của người dùng kèm số lượng ảnh và ảnh bìa
 */
export async function listCollections(userId: string): Promise<CollectionSummary[]> {
  const rows = await query<any>(
    `SELECT c.id, c.user_id, c.name, c.theme, c.description, c.is_public, c.cover_image_id,
            c.created_at, c.updated_at,
            COUNT(ci.image_id)::int AS image_count,
            COALESCE(
              cov.storage_path,
              (SELECT i2.storage_path
               FROM collection_images ci2
               JOIN images i2 ON ci2.image_id = i2.id
               WHERE ci2.collection_id = c.id
               ORDER BY ci2.added_at DESC
               LIMIT 1)
            ) AS cover_image_url
     FROM collections c
     LEFT JOIN collection_images ci ON c.id = ci.collection_id
     LEFT JOIN images cov ON c.cover_image_id = cov.id
     WHERE c.user_id = $1
     GROUP BY c.id, cov.storage_path
     ORDER BY c.created_at DESC`,
    [userId],
  );

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    theme: r.theme,
    description: r.description,
    coverImageId: r.cover_image_id,
    coverImageUrl: r.cover_image_url,
    imageCount: parseInt(r.image_count, 10) || 0,
    isPublic: !!r.is_public,
    createdAt: new Date(r.created_at).toISOString(),
    updatedAt: new Date(r.updated_at).toISOString(),
  }));
}

/**
 * 2. POST /api/collections
 * Tạo bộ sưu tập mới (kiểm tra trùng tên trong cùng user, giới hạn tối đa 20 bộ/người)
 */
export async function createCollection(
  userId: string,
  data: {
    name: string;
    theme?: string;
    description?: string;
    isPublic?: boolean;
    coverImageId?: string;
  },
): Promise<CollectionSummary> {
  const trimmedName = data.name.trim();
  if (!trimmedName) {
    throw applicationError('Tên bộ sưu tập không được để trống', 400, 'VALIDATION_ERROR');
  }

  // 1. Giới hạn tối đa 20 bộ sưu tập / người dùng
  const countRow = await queryOne<{ count: string }>(
    'SELECT COUNT(*)::text AS count FROM collections WHERE user_id = $1',
    [userId],
  );
  const currentCount = parseInt(countRow?.count ?? '0', 10);
  if (currentCount >= 20) {
    throw applicationError('Mỗi người dùng chỉ được tạo tối đa 20 bộ sưu tập', 400, 'COLLECTION_LIMIT_EXCEEDED');
  }

  // 2. Kiểm tra trùng tên trong cùng user
  const duplicate = await queryOne<{ id: string }>(
    'SELECT id FROM collections WHERE user_id = $1 AND lower(name) = lower($2)',
    [userId, trimmedName],
  );
  if (duplicate) {
    throw applicationError('Bộ sưu tập với tên này đã tồn tại', 409, 'DUPLICATE_COLLECTION_NAME');
  }

  // 3. Kiểm tra coverImageId nếu truyền vào
  let validCoverId: string | null = null;
  if (data.coverImageId && UUID_REGEX.test(data.coverImageId)) {
    const img = await queryOne<{ id: string }>('SELECT id FROM images WHERE id = $1', [data.coverImageId]);
    if (img) validCoverId = img.id;
  }

  const row = await queryOne<any>(
    `INSERT INTO collections (user_id, name, theme, description, is_public, cover_image_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, name, theme, description, is_public, cover_image_id, created_at, updated_at`,
    [
      userId,
      trimmedName,
      data.theme?.trim() || null,
      data.description?.trim() || null,
      data.isPublic ?? false,
      validCoverId,
    ],
  );

  if (!row) {
    throw applicationError('Không thể tạo bộ sưu tập', 500, 'INTERNAL_ERROR');
  }

  return {
    id: row.id,
    name: row.name,
    theme: row.theme,
    description: row.description,
    coverImageId: row.cover_image_id,
    coverImageUrl: null,
    imageCount: 0,
    isPublic: !!row.is_public,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

/**
 * 3. GET /api/collections/:id
 * Xem chi tiết bộ sưu tập và danh sách ảnh
 */
export async function getCollection(userId: string, collectionId: string): Promise<CollectionDetail> {
  if (!UUID_REGEX.test(collectionId)) {
    throw applicationError('Không tìm thấy bộ sưu tập', 404, 'COLLECTION_NOT_FOUND');
  }

  const col = await queryOne<any>(
    `SELECT c.id, c.user_id, c.name, c.theme, c.description, c.is_public, c.cover_image_id,
            c.created_at, c.updated_at,
            cov.storage_path AS cover_image_url
     FROM collections c
     LEFT JOIN images cov ON c.cover_image_id = cov.id
     WHERE c.id = $1`,
    [collectionId],
  );

  if (!col || (col.user_id !== userId && !col.is_public)) {
    throw applicationError('Không tìm thấy bộ sưu tập', 404, 'COLLECTION_NOT_FOUND');
  }

  // Danh sách ảnh trong bộ sưu tập
  const imgRows = await query<any>(
    `SELECT i.id, i.original_filename, i.storage_path, i.thumbnail_path, i.mime_type,
            i.file_size_bytes, i.width_px, i.height_px, ci.added_at
     FROM collection_images ci
     JOIN images i ON ci.image_id = i.id
     WHERE ci.collection_id = $1
     ORDER BY ci.added_at DESC`,
    [collectionId],
  );

  // Lấy detected objects cho tất cả ảnh
  const imageIds = imgRows.map((img) => img.id);
  const objectMap: Record<string, any[]> = {};

  if (imageIds.length > 0) {
    const objects = await query<any>(
      `SELECT id, image_id, label, confidence, bbox_x, bbox_y, bbox_w, bbox_h
       FROM detected_objects
       WHERE image_id = ANY($1)`,
      [imageIds],
    );
    for (const obj of objects) {
      if (!objectMap[obj.image_id]) objectMap[obj.image_id] = [];
      objectMap[obj.image_id].push({
        id: obj.id,
        label: obj.label,
        confidence: Number(obj.confidence),
        bbox: {
          x: Number(obj.bbox_x),
          y: Number(obj.bbox_y),
          w: Number(obj.bbox_w),
          h: Number(obj.bbox_h),
        },
      });
    }
  }

  const images: CollectionImageItem[] = imgRows.map((r) => ({
    id: r.id,
    originalFilename: r.original_filename,
    storagePath: r.storage_path,
    thumbnailPath: r.thumbnail_path,
    mimeType: r.mime_type,
    fileSizeBytes: parseInt(r.file_size_bytes, 10),
    widthPx: r.width_px,
    heightPx: r.height_px,
    addedAt: new Date(r.added_at).toISOString(),
    detectedObjects: objectMap[r.id] || [],
  }));

  return {
    id: col.id,
    name: col.name,
    theme: col.theme,
    description: col.description,
    coverImageId: col.cover_image_id,
    coverImageUrl: col.cover_image_url || images[0]?.storagePath || null,
    imageCount: images.length,
    isPublic: !!col.is_public,
    createdAt: new Date(col.created_at).toISOString(),
    updatedAt: new Date(col.updated_at).toISOString(),
    images,
  };
}

/**
 * 4. PATCH /api/collections/:id
 * Đổi tên, chủ đề, mô tả, ảnh bìa
 */
export async function updateCollection(
  userId: string,
  collectionId: string,
  data: {
    name?: string;
    theme?: string;
    description?: string;
    isPublic?: boolean;
    coverImageId?: string | null;
  },
): Promise<CollectionSummary> {
  if (!UUID_REGEX.test(collectionId)) {
    throw applicationError('Không tìm thấy bộ sưu tập', 404, 'COLLECTION_NOT_FOUND');
  }

  const existing = await queryOne<any>(
    'SELECT * FROM collections WHERE id = $1 AND user_id = $2',
    [collectionId, userId],
  );
  if (!existing) {
    throw applicationError('Không tìm thấy bộ sưu tập', 404, 'COLLECTION_NOT_FOUND');
  }

  // Nếu đổi tên -> kiểm tra trùng với các collection khác của user
  if (data.name !== undefined) {
    const trimmed = data.name.trim();
    if (!trimmed) {
      throw applicationError('Tên bộ sưu tập không được để trống', 400, 'VALIDATION_ERROR');
    }
    const dup = await queryOne<{ id: string }>(
      'SELECT id FROM collections WHERE user_id = $1 AND lower(name) = lower($2) AND id != $3',
      [userId, trimmed, collectionId],
    );
    if (dup) {
      throw applicationError('Bộ sưu tập với tên này đã tồn tại', 409, 'DUPLICATE_COLLECTION_NAME');
    }
  }

  const updatedName = data.name !== undefined ? data.name.trim() : existing.name;
  const updatedTheme = data.theme !== undefined ? data.theme.trim() : existing.theme;
  const updatedDesc = data.description !== undefined ? data.description.trim() : existing.description;
  const updatedIsPublic = data.isPublic !== undefined ? data.isPublic : existing.is_public;

  let updatedCoverId = existing.cover_image_id;
  if (data.coverImageId !== undefined) {
    if (data.coverImageId === null) {
      updatedCoverId = null;
    } else if (UUID_REGEX.test(data.coverImageId)) {
      const img = await queryOne<{ id: string }>('SELECT id FROM images WHERE id = $1', [data.coverImageId]);
      if (img) updatedCoverId = img.id;
    }
  }

  const row = await queryOne<any>(
    `UPDATE collections
     SET name = $1, theme = $2, description = $3, is_public = $4, cover_image_id = $5, updated_at = NOW()
     WHERE id = $6 AND user_id = $7
     RETURNING *`,
    [updatedName, updatedTheme, updatedDesc, updatedIsPublic, updatedCoverId, collectionId, userId],
  );

  const countRow = await queryOne<{ count: string }>(
    'SELECT COUNT(*)::text AS count FROM collection_images WHERE collection_id = $1',
    [collectionId],
  );

  return {
    id: row.id,
    name: row.name,
    theme: row.theme,
    description: row.description,
    coverImageId: row.cover_image_id,
    coverImageUrl: null,
    imageCount: parseInt(countRow?.count ?? '0', 10),
    isPublic: !!row.is_public,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

/**
 * Helper: dọn dẹp các ảnh không còn thuộc bộ sưu tập nào và không thuộc saved_words
 */
async function cleanupOrphanImages(imageIds: string[]): Promise<void> {
  for (const imgId of imageIds) {
    try {
      const refs = await queryOne<{ col_count: string; saved_count: string }>(
        `SELECT
          (SELECT COUNT(*) FROM collection_images WHERE image_id = $1)::text AS col_count,
          (SELECT COUNT(*) FROM saved_words WHERE image_id = $1)::text AS saved_count`,
        [imgId],
      );

      const colCount = parseInt(refs?.col_count ?? '0', 10);
      const savedCount = parseInt(refs?.saved_count ?? '0', 10);

      if (colCount === 0 && savedCount === 0) {
        const img = await queryOne<{ storage_path: string }>('SELECT storage_path FROM images WHERE id = $1', [imgId]);
        if (img?.storage_path) {
          if (img.storage_path.startsWith('http')) {
            try {
              await cloudinaryAdapter.deleteImage(img.storage_path);
            } catch (err) {
              logger.warn(`Failed to delete Cloudinary image: ${img.storage_path}`, { error: err });
            }
          } else if (fs.existsSync(img.storage_path)) {
            try {
              fs.unlinkSync(img.storage_path);
            } catch (err) {
              logger.warn(`Failed to delete local file: ${img.storage_path}`, { error: err });
            }
          }
        }
        await query('DELETE FROM images WHERE id = $1', [imgId]);
      }
    } catch (e) {
      logger.error(`Error cleaning up orphan image ${imgId}`, { error: e });
    }
  }
}

/**
 * 5. DELETE /api/collections/:id
 * Xóa bộ sưu tập (gỡ liên kết ảnh, tự động dọn dẹp ảnh mồ côi)
 */
export async function deleteCollection(userId: string, collectionId: string): Promise<void> {
  if (!UUID_REGEX.test(collectionId)) {
    throw applicationError('Không tìm thấy bộ sưu tập', 404, 'COLLECTION_NOT_FOUND');
  }

  const existing = await queryOne<{ id: string }>(
    'SELECT id FROM collections WHERE id = $1 AND user_id = $2',
    [collectionId, userId],
  );
  if (!existing) {
    throw applicationError('Không tìm thấy bộ sưu tập', 404, 'COLLECTION_NOT_FOUND');
  }

  // Lấy danh sách ảnh thuộc bộ này trước khi xóa
  const images = await query<{ image_id: string }>(
    'SELECT image_id FROM collection_images WHERE collection_id = $1',
    [collectionId],
  );
  const imageIds = images.map((i) => i.image_id);

  // Xóa collection (CASCADE tự xóa collection_images)
  await query('DELETE FROM collections WHERE id = $1 AND user_id = $2', [collectionId, userId]);

  // Dọn dẹp ảnh mồ côi
  if (imageIds.length > 0) {
    await cleanupOrphanImages(imageIds);
  }
}

/**
 * 6. POST /api/collections/:id/images
 * Nhận analysisId từ phiên phân tích tạm (hạn 30 phút trong analysis_sessions),
 * thực thi SQL Transaction lưu ảnh vào collection_images. Giới hạn max 50 ảnh/bộ.
 */
export async function addImageToCollection(
  userId: string,
  collectionId: string,
  analysisId?: string,
  imageId?: string,
): Promise<{ message: string; imageId: string; collectionId: string }> {
  if (!UUID_REGEX.test(collectionId)) {
    throw applicationError('Không tìm thấy bộ sưu tập', 404, 'COLLECTION_NOT_FOUND');
  }

  // 1. Kiểm tra quyền sở hữu bộ sưu tập
  const col = await queryOne<{ id: string }>(
    'SELECT id FROM collections WHERE id = $1 AND user_id = $2',
    [collectionId, userId],
  );
  if (!col) {
    throw applicationError('Không tìm thấy bộ sưu tập', 404, 'COLLECTION_NOT_FOUND');
  }

  // 2. Giới hạn max 50 ảnh/bộ
  const countRow = await queryOne<{ count: string }>(
    'SELECT COUNT(*)::text AS count FROM collection_images WHERE collection_id = $1',
    [collectionId],
  );
  const currentImagesCount = parseInt(countRow?.count ?? '0', 10);
  if (currentImagesCount >= 50) {
    throw applicationError('Bộ sưu tập đã đạt giới hạn tối đa 50 ảnh', 400, 'COLLECTION_IMAGE_LIMIT_EXCEEDED');
  }

  let resolvedImageId = imageId;

  // 3. Phân tích analysisId nếu có (hạn 30 phút trong analysis_sessions)
  if (analysisId) {
    const session = await queryOne<{ id: string; image_id: string; started_at: Date }>(
      `SELECT id, image_id, started_at
       FROM analysis_sessions
       WHERE (id = $1 OR image_id = $1)
       ORDER BY started_at DESC
       LIMIT 1`,
      [analysisId],
    );

    if (!session) {
      throw applicationError('Phiên phân tích không tồn tại', 404, 'ANALYSIS_NOT_FOUND');
    }

    const sessionAgeMs = Date.now() - new Date(session.started_at).getTime();
    const thirtyMinutesMs = 30 * 60 * 1000;
    if (sessionAgeMs > thirtyMinutesMs) {
      throw applicationError(
        'Phiên phân tích đã hết hạn (tối đa 30 phút)',
        410,
        'ANALYSIS_EXPIRED',
      );
    }

    resolvedImageId = session.image_id;
  }

  if (!resolvedImageId || !UUID_REGEX.test(resolvedImageId)) {
    throw applicationError('Yêu cầu analysisId hoặc imageId hợp lệ', 400, 'VALIDATION_ERROR');
  }

  // 4. Kiểm tra ảnh tồn tại trong CSDL
  const imgRow = await queryOne<{ id: string }>(
    'SELECT id FROM images WHERE id = $1',
    [resolvedImageId],
  );
  if (!imgRow) {
    throw applicationError('Không tìm thấy ảnh', 404, 'IMAGE_NOT_FOUND');
  }

  // 5. Kiểm tra ảnh đã có trong bộ sưu tập này chưa
  const alreadyInCol = await queryOne<{ id: string }>(
    'SELECT id FROM collection_images WHERE collection_id = $1 AND image_id = $2',
    [collectionId, resolvedImageId],
  );
  if (alreadyInCol) {
    throw applicationError('Ảnh này đã có trong bộ sưu tập', 409, 'IMAGE_ALREADY_IN_COLLECTION');
  }

  // 6. Thực thi SQL Transaction
  await query('BEGIN');
  try {
    // Gắn quyền sở hữu ảnh cho user nếu chưa có
    await query('UPDATE images SET user_id = $1 WHERE id = $2 AND user_id IS NULL', [userId, resolvedImageId]);

    // Thêm vào collection_images
    await query(
      'INSERT INTO collection_images (collection_id, image_id, added_at) VALUES ($1, $2, NOW())',
      [collectionId, resolvedImageId],
    );

    // Cập nhật updated_at cho collection
    await query('UPDATE collections SET updated_at = NOW() WHERE id = $1', [collectionId]);

    await query('COMMIT');
  } catch (err) {
    await query('ROLLBACK');
    throw err;
  }

  return {
    message: 'Đã thêm ảnh vào bộ sưu tập thành công',
    imageId: resolvedImageId,
    collectionId,
  };
}

/**
 * 7. DELETE /api/collections/:id/images/:imageId
 * Gỡ ảnh khỏi bộ sưu tập (nếu ảnh không còn ở bộ nào khác thì xóa hoàn toàn file và dữ liệu)
 */
export async function removeImageFromCollection(
  userId: string,
  collectionId: string,
  imageId: string,
): Promise<{ message: string }> {
  if (!UUID_REGEX.test(collectionId) || !UUID_REGEX.test(imageId)) {
    throw applicationError('Tham số không hợp lệ', 400, 'VALIDATION_ERROR');
  }

  // Kiểm tra quyền sở hữu bộ sưu tập
  const col = await queryOne<{ id: string }>(
    'SELECT id FROM collections WHERE id = $1 AND user_id = $2',
    [collectionId, userId],
  );
  if (!col) {
    throw applicationError('Không tìm thấy bộ sưu tập', 404, 'COLLECTION_NOT_FOUND');
  }

  // Kiểm tra ảnh có trong bộ sưu tập hay không
  const link = await queryOne<{ id: string }>(
    'SELECT id FROM collection_images WHERE collection_id = $1 AND image_id = $2',
    [collectionId, imageId],
  );
  if (!link) {
    throw applicationError('Ảnh không thuộc bộ sưu tập này', 404, 'IMAGE_NOT_IN_COLLECTION');
  }

  // Gỡ liên kết
  await query('DELETE FROM collection_images WHERE collection_id = $1 AND image_id = $2', [collectionId, imageId]);
  await query('UPDATE collections SET updated_at = NOW() WHERE id = $1', [collectionId]);

  // Kiểm tra và dọn dẹp ảnh mồ côi
  await cleanupOrphanImages([imageId]);

  return { message: 'Đã gỡ ảnh khỏi bộ sưu tập' };
}

/**
 * 8. GET /api/collections/:id/vocabulary
 * Gộp toàn bộ từ vựng của các vật thể trong bộ sưu tập, tự động loại bỏ trùng và thống kê số lần xuất hiện
 */
export async function getCollectionVocabulary(
  userId: string,
  collectionId: string,
): Promise<CollectionVocabularyResult> {
  if (!UUID_REGEX.test(collectionId)) {
    throw applicationError('Không tìm thấy bộ sưu tập', 404, 'COLLECTION_NOT_FOUND');
  }

  const col = await queryOne<{ id: string }>(
    'SELECT id FROM collections WHERE id = $1 AND (user_id = $2 OR is_public = true)',
    [collectionId, userId],
  );
  if (!col) {
    throw applicationError('Không tìm thấy bộ sưu tập', 404, 'COLLECTION_NOT_FOUND');
  }

  const rows = await query<any>(
    `SELECT lower(do.label) AS word,
            COUNT(*)::int AS occurrences,
            v.id AS vocabulary_id,
            v.meaning_vi,
            v.ipa,
            v.example_sentence
     FROM collection_images ci
     JOIN detected_objects do ON ci.image_id = do.image_id
     LEFT JOIN vocabularies v ON lower(v.word) = lower(do.label)
     WHERE ci.collection_id = $1
     GROUP BY lower(do.label), v.id, v.meaning_vi, v.ipa, v.example_sentence
     ORDER BY occurrences DESC, lower(do.label) ASC`,
    [collectionId],
  );

  const totalWords = rows.reduce((acc, r) => acc + (parseInt(r.occurrences, 10) || 0), 0);
  const words: VocabularyAggregateItem[] = rows.map((r) => ({
    word: r.word,
    meaningVi: r.meaning_vi || null,
    ipa: r.ipa || null,
    example: r.example_sentence || null,
    occurrences: parseInt(r.occurrences, 10) || 0,
    vocabularyId: r.vocabulary_id || null,
  }));

  return {
    collectionId,
    totalWords,
    uniqueWords: words.length,
    words,
  };
}
