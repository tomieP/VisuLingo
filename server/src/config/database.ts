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
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle PostgreSQL client', err);
  if (env.NODE_ENV === 'production') process.exit(-1);
});

/**
 * Query helper with proper error handling and logging.
 * @param text SQL query string
 * @param params Query parameters (optional)
 */
export async function query<T>(text: string, params?: any[]): Promise<T[]> {
  try {
    const result = await pool.query(text, params);
    return result.rows as T[];
  } catch (err) {
    logger.error(`Database query failed: ${text}`, err as Error);
    throw err;
  }
}

export async function queryOne<T>(text: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

export default pool;