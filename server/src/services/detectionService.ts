import { query } from '../config/database';
import { cloudinaryAdapter } from '../adapters/CloudinaryAdapter';
import { visionAdapter } from '../adapters/VisionAdapter';
import { normalizeLabel } from '../utils/labelNormalizer';
import { randomUUID } from 'node:crypto';
import logger from '../utils/logger';
import { env, isProduction } from '../config/env';

export interface DetectionServiceResult {
  imageId: string;
  imageUrl: string;
  objects: Array<{
    id: string;
    label: string;
    confidence: number;
    bbox: { x: number; y: number; w: number; h: number };
  }>;
}

/**
 * Validate image format using magic bytes (content-based check).
 */
function checkMagicBytes(buffer: Buffer): boolean {
  if (buffer.length < 12) return false;

  const b = buffer;

  // JPEG: starts with 0xFF 0xD8 0xFF
  if (b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF) return true;

  // PNG: starts with 0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47 &&
      b[4] === 0x0D && b[5] === 0x0A && b[6] === 0x1A && b[7] === 0x0A) return true;

  // WebP: starts with 'RIFF' + 4 bytes + 'WEBP'
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return true;

  return false;
}

/**
 * Analyze an uploaded image: validate, store, detect objects.
 * Authenticated users get Cloudinary storage; guests use temp memory.
 */
export async function analyzeImage(
  imageBuffer: Buffer,
  mimeType: string,
  originalFilename: string,
  fileSizeBytes: number,
  userId?: string,
): Promise<DetectionServiceResult> {
  const imageId = randomUUID();
  const startedAt = new Date();

  // --- Content-based validation (magic bytes) ---
  if (!checkMagicBytes(imageBuffer)) {
    const err: any = new Error('Invalid image format. Only JPEG, PNG, and WebP are accepted.');
    err.statusCode = 415;
    err.code = 'INVALID_FORMAT';
    err.retryable = false;
    throw err;
  }

  if (fileSizeBytes > env.MAX_UPLOAD_MB * 1024 * 1024) {
    const err: any = new Error(`File exceeds maximum size of ${env.MAX_UPLOAD_MB}MB.`);
    err.statusCode = 413;
    err.code = 'FILE_TOO_LARGE';
    err.retryable = false;
    throw err;
  }

  // --- Storage ---
  let storagePath = `memory://${imageId}`;
  let imageUrl = storagePath;

  if (userId) {
    try {
      const uploaded = await cloudinaryAdapter.uploadImageBuffer(
        imageBuffer,
        `visulingo/user_${userId}/images`,
      );
      storagePath = uploaded.storageKey;
      imageUrl = uploaded.secureUrl;
    } catch (cloudErr) {
      logger.warn('Cloudinary upload failed, falling back to memory storage', { error: cloudErr });
    }
  }

  // --- DB: images row ---
  try {
    await query(
      `INSERT INTO images (id, user_id, original_filename, storage_path, mime_type, file_size_bytes)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [imageId, userId ?? null, originalFilename, storagePath, mimeType, fileSizeBytes],
    );
  } catch (err) {
    logger.warn('Database insert into images skipped (PostgreSQL not connected)');
  }

  // --- Vision detection ---
  let detected;
  try {
    detected = await visionAdapter.analyze(imageBuffer, mimeType);
  } catch (visionErr: any) {
    if (visionErr.message === 'Vision API timeout') {
      const err: any = new Error('AI vision service timed out.');
      err.statusCode = 504;
      err.code = 'AI_TIMEOUT';
      err.retryable = true;
      throw err;
    }
    const err: any = new Error('AI vision service unavailable.');
    err.statusCode = 502;
    err.code = 'AI_UPSTREAM_ERROR';
    err.retryable = true;
    throw err;
  }

  // --- Normalize labels via label_mappings DB table ---
  const objects = [];
  for (const item of detected) {
    const objId = `obj_${objects.length + 1}`;
    let label = normalizeLabel(item.label);

    // Lookup label_mappings for normalized label
    try {
      const mapping = await query<{ normalized_label: string }>(
        `SELECT normalized_label FROM label_mappings WHERE raw_label = $1 AND is_active = true LIMIT 1`,
        [label],
      );
      if (mapping.length > 0) {
        label = mapping[0].normalized_label;
      }
    } catch {
      // DB lookup skipped
    }

    // DB: detected_objects row
    try {
      await query(
        `INSERT INTO detected_objects
         (id, image_id, label, confidence, bbox_x, bbox_y, bbox_w, bbox_h, raw_label)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [randomUUID(), imageId, label, item.confidence,
          item.boundingBox.x, item.boundingBox.y, item.boundingBox.w, item.boundingBox.h,
          item.label],
      );
    } catch {
      // DB insert skipped
    }

    objects.push({
      id: objId,
      label,
      confidence: item.confidence,
      bbox: item.boundingBox,
    });
  }

  // --- DB: analysis_sessions row ---
  try {
    await query(
      `INSERT INTO analysis_sessions
       (image_id, user_id, total_objects, confidence_threshold, started_at, completed_at, status)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, 'completed')`,
      [imageId, userId ?? null, objects.length, env.CONFIDENCE_THRESHOLD, startedAt],
    );
  } catch {
    // DB insert skipped
  }

  return { imageId, imageUrl, objects };
}
