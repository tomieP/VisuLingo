"""
Database seed script for VisuLingo.
Populates label_mappings and vocabularies tables with initial data.
"""

import { query } from '../config/database';
import logger from '../utils/logger';

async function seedLabelMappings(): Promise<void> {
  const labelMappings = [
    { raw: 'cell phone', normalized: 'phone' },
    { raw: 'smartphone', normalized: 'phone' },
    { raw: 'telephone', normalized: 'phone' },
    { raw: 'mobile phone', normalized: 'phone' },
    { raw: 'laptop computer', normalized: 'laptop' },
    { raw: 'notebook', normalized: 'laptop' },
    { raw: 'cup', normalized: 'cup' },
    { raw: 'mug', normalized: 'cup' },
    { raw: 'book', normalized: 'book' },
    { raw: 'novel', normalized: 'book' },
    { raw: 'magazine', normalized: 'book' },
    { raw: 'chair', normalized: 'chair' },
    { raw: 'stool', normalized: 'chair' },
    { raw: 'table', normalized: 'table' },
    { raw: 'desk', normalized: 'table' },
    { raw: 'pen', normalized: 'pen' },
    { raw: 'pencil', normalized: 'pen' },
    { raw: 'marker', normalized: 'pen' },
    { raw: 'clock', normalized: 'clock' },
    { raw: 'watch', normalized: 'clock' },
    { raw: 'bottle', normalized: 'bottle' },
    { raw: 'jar', normalized: 'bottle' },
    { raw: 'keyboard', normalized: 'keyboard' },
    { raw: 'keypad', normalized: 'keyboard' },
    { raw: 'computer', normalized: 'laptop' }, // Generic computer mapping
    { raw: 'monitor', normalized: 'laptop' }, // General display mapping
    { raw: 'printer', normalized: 'laptop' }, // Output device mapping
    { raw: 'router', normalized: 'phone' }, // Network device mapping
    { raw: 'modem', normalized: 'phone' }, // Connectivity mapping
    { raw: 'headphone', normalized: 'phone' }, // Audio device mapping
  ];

  try {
    for (const mapping of labelMappings) {
      await query(
        `INSERT INTO label_mappings (raw_label, normalized_label, is_active)
         VALUES ($1, $2, true)
         ON CONFLICT (raw_label, language) DO NOTHING`,
        [mapping.raw, mapping.normalized],
      );
    }
    logger.info(`Seeded ${labelMappings.length} label mappings`);
  } catch (error) {
    logger.error('Failed to seed label mappings', error);
    throw error;
  }
}

async function seedBasicVocabularies(): Promise<void> {
  const vocabularies = [
    {
      word: 'phone',
      meaning_vi: 'điện thoại di động',
      ipa: '/foʊn/',
      example: 'He is talking on the phone.',
      source: 'manual',
    },
    {
      word: 'laptop',
      meaning_vi: 'máy tính xách tay',
      ipa: '/`læp.tɒp/',
      example: 'She works on her laptop every day.',
      source: 'manual',
    },
    {
      word: 'cup',
      meaning_vi: 'cái cốc',
      ipa: '/kʌp/',
      example: 'There is a cup on the table.',
      source: 'manual',
    },
    {
      word: 'book',
      meaning_vi: 'quyển sách',
      ipa: '/bʊk/',
      example: 'I am reading an interesting book.',
      source: 'manual',
    },
    {
      word: 'chair',
      meaning_vi: 'cái ghế',
      ipa: '/tʃeər/',
      example: 'Please sit on this chair.',
      source: 'manual',
    },
    {
      word: 'table',
      meaning_vi: 'cái bàn',
      ipa: '/`teɪ.bəl/',
      example: 'The keys are on the table.',
      source: 'manual',
    },
    {
      word: 'pen',
      meaning_vi: 'cây bút',
      ipa: '/pen/',
      example: 'Can I borrow your pen?',
      source: 'manual',
    },
    {
      word: 'clock',
      meaning_vi: 'đồng hồ',
      ipa: '/klɒk/',
      example: 'The clock shows ten o’clock.',
      source: 'manual',
    },
    {
      word: 'bottle',
      meaning_vi: 'cái chai',
      ipa: '/`bɒt.əl/',
      example: 'She filled the bottle with water.',
      source: 'manual',
    },
    {
      word: 'keyboard',
      meaning_vi: 'bàn phím',
      ipa: '/`kiː.bɔːd/',
      example: 'The keyboard is next to the monitor.',
      source: 'manual',
    },
  ];

  try {
    for (const vocab of vocabularies) {
      await query(
        `INSERT INTO vocabularies (word, meaning_vi, ipa, example_sentence, source, status)
         VALUES ($1, $2, $3, $4, $5, 'verified')
         ON CONFLICT (word) DO NOTHING`,
        [vocab.word, vocab.meaning_vi, vocab.ipa, vocab.example, vocab.source],
      );
    }
    logger.info(`Seeded ${vocabularies.length} vocabularies`);
  } catch (error) {
    logger.error('Failed to seed vocabularies', error);
    throw error;
  }
}

async function seedAppSettings(): Promise<void> {
  const settings = [
    {
      key: 'confidence_threshold',
      value: '0.5',
      description: 'Minimum confidence score for object detection (0-1)',
    },
    {
      key: 'max_upload_mb',
      value: '10',
      description: 'Maximum upload file size in MB',
    },
    {
      key: 'rate_limit_per_min',
      value: '10',
      description: 'Maximum API requests per minute per IP',
    },
  ];

  try {
    for (const setting of settings) {
      await query(
        `INSERT INTO app_settings (key, value, description)
         VALUES ($1, $2, $3)
         ON CONFLICT (key) DO NOTHING`,
        [setting.key, setting.value, setting.description],
      );
    }
    logger.info(`Seeded ${settings.length} app settings`);
  } catch (error) {
    logger.error('Failed to seed app settings', error);
    throw error;
  }
}

async function main(): Promise<void> {
  try {
    logger.info('Starting database seeding...');

    await seedLabelMappings();
    await seedBasicVocabularies();
    await seedAppSettings();

    logger.info('Database seeding completed successfully');
  } catch (error) {
    logger.error('Database seeding failed', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { seedLabelMappings, seedBasicVocabularies, seedAppSettings };
