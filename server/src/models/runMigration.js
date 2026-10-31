#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://user:pass@localhost:5432/vocab_db',
});

async function runMigration() {
  const migrationPath = path.resolve(process.cwd(), 'src/models/migration.sql');
  const sql = fs.readFileSync(migrationPath, 'utf-8');

  console.log('Running database migration...');
  try {
    await pool.query(sql);
    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();