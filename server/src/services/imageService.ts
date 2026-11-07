import { query, queryOne } from '../config/database';
import { env } from '../config/env';
import jwt from 'jsonwebtoken';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function applicationError(message: string, statusCode: number, code: string, retryable = false) {
  return Object.assign(new Error(message), { statusCode, code, retryable });
}

export interface ImageDetailResult {
  id: string;
  userId: string | null;
  originalFilename: string;
  storagePath: string;
  thumbnailPath?: string | null;
  mimeType: string;
  fileSizeBytes: number;
  widthPx?: number | null;
  heightPx?: number | null;
  uploadedAt: string;
  detectedObjects: Array<{
    id: string;
    label: string;
    confidence: number;
    bbox: { x: number; y: number; w: number; h: number };
  }>;
}

export interface ImageFileResult {
  filePath?: string;
  url?: string;
  mimeType: string;
  isExternal: boolean;
  signedToken?: string;
}

/**
 * 1. GET /api/images/:id
 * Trả về thông tin chi tiết của ảnh (chỉ chủ sở hữu hoặc ảnh trong collection public)
 */
export async function getImageDetails(userId: string, imageId: string): Promise<ImageDetailResult> {
  if (!UUID_REGEX.test(imageId)) {
    throw applicationError('Không tìm thấy ảnh', 404, 'IMAGE_NOT_FOUND');
  }

  const row = await queryOne<any>(
    `SELECT i.*,
       EXISTS(
         SELECT 1 FROM collection_images ci
         JOIN collections c ON ci.collection_id = c.id
         WHERE ci.image_id = i.id AND c.is_public = true
       ) AS is_in_public_collection
     FROM images i
     WHERE i.id = $1`,
    [imageId],
  );

  if (!row || (row.user_id !== userId && !row.is_in_public_collection)) {
    throw applicationError('Không tìm thấy ảnh hoặc bạn không có quyền truy cập', 404, 'IMAGE_NOT_FOUND');
  }

  const objects = await query<any>(
    `SELECT id, label, confidence, bbox_x, bbox_y, bbox_w, bbox_h
     FROM detected_objects
     WHERE image_id = $1`,
    [imageId],
  );

  return {
    id: row.id,
    userId: row.user_id,
    originalFilename: row.original_filename,
    storagePath: row.storage_path,
    thumbnailPath: row.thumbnail_path,
    mimeType: row.mime_type,
    fileSizeBytes: parseInt(row.file_size_bytes, 10),
    widthPx: row.width_px,
    heightPx: row.height_px,
    uploadedAt: new Date(row.uploaded_at).toISOString(),
    detectedObjects: objects.map((obj) => ({
      id: obj.id,
      label: obj.label,
      confidence: Number(obj.confidence),
      bbox: {
        x: Number(obj.bbox_x),
        y: Number(obj.bbox_y),
        w: Number(obj.bbox_w),
        h: Number(obj.bbox_h),
      },
    })),
  };
}

/**
 * 2. GET /api/images/:id/file
 * Trả về signed URL hoặc file path có hạn ngắn (15 phút) để xem file ảnh/thumbnail
 */
export async function getImageFile(
  userId: string,
  imageId: string,
  type: 'original' | 'thumbnail' = 'original',
): Promise<ImageFileResult> {
  if (!UUID_REGEX.test(imageId)) {
    throw applicationError('Không tìm thấy ảnh', 404, 'IMAGE_NOT_FOUND');
  }

  const row = await queryOne<any>(
    `SELECT i.*,
       EXISTS(
         SELECT 1 FROM collection_images ci
         JOIN collections c ON ci.collection_id = c.id
         WHERE ci.image_id = i.id AND c.is_public = true
       ) AS is_in_public_collection
     FROM images i
     WHERE i.id = $1`,
    [imageId],
  );

  if (!row || (row.user_id !== userId && !row.is_in_public_collection)) {
    throw applicationError('Không tìm thấy ảnh hoặc bạn không có quyền truy cập', 404, 'IMAGE_NOT_FOUND');
  }

  const targetPath = type === 'thumbnail' && row.thumbnail_path ? row.thumbnail_path : row.storage_path;

  // Tạo signed token hết hạn ngắn (15 phút) để truy xuất file an toàn
  const signedToken = jwt.sign(
    { imageId: row.id, userId, type, exp: Math.floor(Date.now() / 1000) + 15 * 60 },
    env.JWT_SECRET,
  );

  if (targetPath.startsWith('http://') || targetPath.startsWith('https://')) {
    return {
      url: targetPath,
      mimeType: row.mime_type,
      isExternal: true,
      signedToken,
    };
  }

  return {
    filePath: targetPath,
    mimeType: row.mime_type,
    isExternal: false,
    signedToken,
  };
}
