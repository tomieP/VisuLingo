import { query, queryOne } from '../config/database';
import { cloudinaryAdapter } from '../adapters/CloudinaryAdapter';
import logger from '../utils/logger';
import fs from 'node:fs';

/**
 * 1. Xóa các bản ghi analysis_sessions cùng file ảnh tạm đã quá 30 phút
 */
export async function cleanExpiredAnalysisSessions(): Promise<{ deletedSessions: number; deletedImages: number }> {
  try {
    // Tìm các phiên quá 30 phút
    const expiredSessions = await query<{ id: string; image_id: string }>(
      `SELECT id, image_id
       FROM analysis_sessions
       WHERE started_at < NOW() - INTERVAL '30 minutes'`,
    );

    if (expiredSessions.length === 0) {
      return { deletedSessions: 0, deletedImages: 0 };
    }

    const sessionIds = expiredSessions.map((s) => s.id);
    const candidateImageIds = [...new Set(expiredSessions.map((s) => s.image_id))];

    // Xóa analysis_sessions
    await query('DELETE FROM analysis_sessions WHERE id = ANY($1)', [sessionIds]);

    let deletedImagesCount = 0;

    // Kiểm tra từng ảnh: nếu không nằm trong collection và không nằm trong saved_words thì xóa
    for (const imgId of candidateImageIds) {
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
              logger.warn(`Failed to delete Cloudinary expired image: ${img.storage_path}`, { error: err });
            }
          } else if (fs.existsSync(img.storage_path)) {
            try {
              fs.unlinkSync(img.storage_path);
            } catch (err) {
              logger.warn(`Failed to delete local expired image file: ${img.storage_path}`, { error: err });
            }
          }
        }
        await query('DELETE FROM images WHERE id = $1', [imgId]);
        deletedImagesCount++;
      }
    }

    logger.info(`Cleaned up ${expiredSessions.length} expired analysis sessions and ${deletedImagesCount} temp images.`);
    return { deletedSessions: expiredSessions.length, deletedImages: deletedImagesCount };
  } catch (error) {
    logger.error('Error during cleanExpiredAnalysisSessions', { error });
    return { deletedSessions: 0, deletedImages: 0 };
  }
}

/**
 * 2. Quét và xóa các file ảnh mồ côi (không thuộc bộ sưu tập nào) sau 24 giờ
 */
export async function cleanOrphanImages(): Promise<{ deletedOrphans: number }> {
  try {
    const orphanImages = await query<{ id: string; storage_path: string }>(
      `SELECT i.id, i.storage_path
       FROM images i
       WHERE i.uploaded_at < NOW() - INTERVAL '24 hours'
         AND NOT EXISTS (SELECT 1 FROM collection_images ci WHERE ci.image_id = i.id)
         AND NOT EXISTS (SELECT 1 FROM saved_words sw WHERE sw.image_id = i.id)`,
    );

    if (orphanImages.length === 0) {
      return { deletedOrphans: 0 };
    }

    let deletedCount = 0;
    for (const img of orphanImages) {
      if (img.storage_path) {
        if (img.storage_path.startsWith('http')) {
          try {
            await cloudinaryAdapter.deleteImage(img.storage_path);
          } catch (err) {
            logger.warn(`Failed to delete Cloudinary orphan image: ${img.storage_path}`, { error: err });
          }
        } else if (fs.existsSync(img.storage_path)) {
          try {
            fs.unlinkSync(img.storage_path);
          } catch (err) {
            logger.warn(`Failed to delete local orphan image file: ${img.storage_path}`, { error: err });
          }
        }
      }
      await query('DELETE FROM images WHERE id = $1', [img.id]);
      deletedCount++;
    }

    logger.info(`Cleaned up ${deletedCount} orphan images older than 24 hours.`);
    return { deletedOrphans: deletedCount };
  } catch (error) {
    logger.error('Error during cleanOrphanImages', { error });
    return { deletedOrphans: 0 };
  }
}

/**
 * Khởi động tiến trình ngầm (định kỳ chạy mỗi 15 phút)
 */
export function startCleanupCron(intervalMs = 15 * 60 * 1000): NodeJS.Timeout {
  logger.info(`Starting periodic cleanup cron job (Interval: ${Math.round(intervalMs / 60000)}m)`);

  const runAll = async () => {
    await cleanExpiredAnalysisSessions();
    await cleanOrphanImages();
  };

  // Chạy lần đầu sau 3 giây khi server khởi động
  setTimeout(() => {
    void runAll();
  }, 3000);

  return setInterval(() => {
    void runAll();
  }, intervalMs);
}
