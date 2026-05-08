import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  seedPhraseHash: text('seed_phrase_hash').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const settings = sqliteTable('settings', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  apiKey: text('api_key').notNull(),
  webhookHmacKey: text('webhook_hmac_key'),
  storagePath: text('storage_path').notNull().default('/data/images'),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  prompt: text('prompt').notNull(),
  aspectRatio: text('aspect_ratio').notNull(),
  resolution: text('resolution').notNull(),
  status: text('status').notNull().default('waiting'),
  resultUrl: text('result_url'),
  localPath: text('local_path'),
  inputUrls: text('input_urls'),
  failCode: text('fail_code'),
  failMsg: text('fail_msg'),
  costTime: integer('cost_time'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
  completedAt: integer('completed_at', { mode: 'timestamp_ms' }),
});

export const prompts = sqliteTable('prompts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  content: text('content').notNull(),
  category: text('category').notNull().default(''),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
});