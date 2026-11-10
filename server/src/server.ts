import fs from 'fs';
import path from 'path';
import app from './app';
import { env } from './config/env';
import logger from './utils/logger';
import { query } from './config/database';
import { startCleanupCron } from './jobs/cleanupJob';

async function autoMigrateDatabase() {
  try {
    const candidates = [
      path.resolve(__dirname, 'models/migration.sql'),
      path.resolve(__dirname, '../models/migration.sql'),
      path.resolve(__dirname, '../src/models/migration.sql'),
      path.resolve(process.cwd(), 'src/models/migration.sql'),
      path.resolve(process.cwd(), 'server/src/models/migration.sql'),
    ];
    const sqlPath = candidates.find((p) => fs.existsSync(p));
    if (sqlPath) {
      const sql = fs.readFileSync(sqlPath, 'utf-8');
      await query(sql);
      logger.info('[Database] Auto-migration successfully verified!');
    }
  } catch (err: any) {
    logger.warn('[Database] Auto-migration check:', err?.message || err);
  }
}

app.listen(env.PORT, async () => {
  logger.info(`VisuLingo API listening on http://localhost:${env.PORT}`);
  logger.info(`Environment: ${env.NODE_ENV}`);

  // Tự động kiểm tra và khởi tạo bảng trong database khi khởi động
  await autoMigrateDatabase();

  // Khởi động các tiến trình ngầm dọn dẹp định kỳ
  startCleanupCron();
});
