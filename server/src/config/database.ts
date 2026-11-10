import { Pool } from 'pg';
import { env } from './env';
import { logger } from '../utils/logger';

function cleanDatabaseUrl(rawUrl: string): string {
  if (!rawUrl) return rawUrl;
  // Tự động làm sạch nếu người dùng lỡ dán cả DATABASE_URL="..." hoặc nhiều dòng từ Neon
  const match = rawUrl.match(/postgres(?:ql)?:\/\/[^\s"']+/);
  if (match) {
    return match[0];
  }
  return rawUrl.trim().replace(/^["']|["']$/g, '');
}

const cleanedDbUrl = cleanDatabaseUrl(env.DATABASE_URL);

const isCloudDb =
  cleanedDbUrl.includes('neon.tech') ||
  cleanedDbUrl.includes('render.com') ||
  cleanedDbUrl.includes('supabase.co') ||
  cleanedDbUrl.includes('sslmode=require') ||
  env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString: cleanedDbUrl,
  ssl: isCloudDb ? { rejectUnauthorized: false } : undefined,
  max: 10,
  idleTimeoutMillis: 15000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  // Ghi log cảnh báo khi client nhàn rỗi ngắt kết nối (do Neon PostgreSQL serverless đóng kết nối idle)
  // Tuyệt đối KHÔNG gọi process.exit() làm crash container Render
  logger.warn('PostgreSQL idle client disconnected (Neon serverless scale down): ' + (err?.message || err));
});

/**
 * Query helper with proper error handling and logging.
 * Tự động thử lại 1 lần nếu kết nối cơ sở dữ liệu vừa bị ngắt do Neon idle timeout
 * @param text SQL query string
 * @param params Query parameters (optional)
 */
export async function query<T>(text: string, params?: any[]): Promise<T[]> {
  try {
    const result = await pool.query(text, params);
    return result.rows as T[];
  } catch (err: any) {
    const isConnError =
      err?.code === 'ECONNRESET' ||
      err?.code === '57P01' ||
      err?.message?.includes('Connection terminated') ||
      err?.message?.includes('closed unexpectedly');

    if (isConnError) {
      logger.warn(`Database connection dropped, auto-retrying query once: ${text.slice(0, 50)}...`);
      try {
        const retryResult = await pool.query(text, params);
        return retryResult.rows as T[];
      } catch (retryErr) {
        logger.error(`Database retry failed: ${text}`, retryErr as Error);
        throw retryErr;
      }
    }

    logger.error(`Database query failed: ${text}`, err as Error);
    throw err;
  }
}

export async function queryOne<T>(text: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

export default pool;