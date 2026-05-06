import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import fs from 'fs';
import path from 'path';

const dbUrl = process.env.DATABASE_URL || 'file:./data/app.db';
const dbPath = dbUrl.startsWith('file:') ? dbUrl.slice(5) : dbUrl;

// Ensure data directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  try {
    fs.mkdirSync(dbDir, { recursive: true });
  } catch (err) {
    throw new Error(`Failed to create database directory at ${dbDir}: ${err}`);
  }
}

let sqlite: Database.Database;
try {
  sqlite = new Database(dbPath);
  sqlite.pragma('journal_mode = WAL');
} catch (err) {
  throw new Error(`Failed to open database at ${dbPath}: ${err}`);
}

export const db = drizzle(sqlite, { schema });

export type Db = typeof db;
export type SettingsRow = typeof schema.settings.$inferSelect;
export type TaskRow = typeof schema.tasks.$inferSelect;
