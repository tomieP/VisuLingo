import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env from server root
// dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
    path: path.resolve(__dirname, '../../.env')
});

interface Env {
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  VISION_API_KEY: string;
  DICTIONARY_API_KEY: string;
  CONFIDENCE_THRESHOLD: number;
  MAX_UPLOAD_MB: number;
  NODE_ENV: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
}

export const env: Env = {
  PORT: Number(process.env.PORT) || 5000,
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://user:pass@localhost:5432/vocab_db',
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret',
  VISION_API_KEY: process.env.VISION_API_KEY || '',
  DICTIONARY_API_KEY: process.env.DICTIONARY_API_KEY || '',
  CONFIDENCE_THRESHOLD: Number(process.env.CONFIDENCE_THRESHOLD) || 0.5,
  MAX_UPLOAD_MB: Number(process.env.MAX_UPLOAD_MB) || 10,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
};

export const isProduction = env.NODE_ENV === 'production';
export const isDevelopment = env.NODE_ENV === 'development';