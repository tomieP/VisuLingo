import app from './app';
import { env } from './config/env';
import logger from './utils/logger';
import { startCleanupCron } from './jobs/cleanupJob';

app.listen(env.PORT, () => {
  logger.info(`VisuLingo API listening on http://localhost:${env.PORT}`);
  logger.info(`Environment: ${env.NODE_ENV}`);

  // Khởi động các tiến trình ngầm dọn dẹp định kỳ
  startCleanupCron();
});
