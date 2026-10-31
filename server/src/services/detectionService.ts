import { query, queryOne } from '../config/database';
import { env } from '../config/env';
import { visionAdapter, VisionAdapterResult } from '../adapters/VisionAdapter';
import { normalizeLabel } from '../utils/labelNormalizer';
import { randomUUID } from 'node:crypto';

export interface DetectionServiceResult {
  imageId: string;
  imageUrl: string;
  objects: Array<{
    id: string;
    label: string;
    confidence: number;
    boundingBox: { x: number; y: number; w: number; h: number };
  }>;
  analyzedAt: string;
}

export async function analyzeImage(
  imageBuffer: Buffer,
  mimeType: string,
  originalFilename: string,
  fileSizeBytes: number,
  userId?: string,
): Promise<DetectionServiceResult> {
  const imageId = randomUUID();
  const startedAt = new Date();

  // storage_path remains an adapter boundary until cloud storage is selected.
  await query(
    `INSERT INTO images (id, user_id, original_filename, storage_path, mime_type, file_size_bytes)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [imageId, userId ?? null, originalFilename, `memory://${imageId}`, mimeType, fileSizeBytes],
  );

  const detected = await visionAdapter.analyze(imageBuffer, mimeType);
  const objects = [];

  for (const item of detected) {
    const id = randomUUID();
    const label = normalizeLabel(item.label);
    await query(
      `INSERT INTO detected_objects
       (id, image_id, label, confidence, bbox_x, bbox_y, bbox_w, bbox_h, raw_label)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [id, imageId, label, item.confidence, item.boundingBox.x, item.boundingBox.y,
        item.boundingBox.w, item.boundingBox.h, item.label],
    );
    objects.push({ id, label, confidence: item.confidence, boundingBox: item.boundingBox });
  }

  await query(
    `INSERT INTO analysis_sessions
     (image_id, user_id, total_objects, confidence_threshold, started_at, completed_at, status)
     VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, 'completed')`,
    [imageId, userId ?? null, objects.length, env.CONFIDENCE_THRESHOLD, startedAt],
  );

  return { imageId, imageUrl: `memory://${imageId}`, objects, analyzedAt: new Date().toISOString() };
}