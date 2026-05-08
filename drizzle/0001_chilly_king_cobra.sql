CREATE TABLE IF NOT EXISTS `users` (
	`id` text PRIMARY KEY NOT NULL,
	`seed_phrase_hash` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `users_seed_phrase_hash_unique` ON `users` (`seed_phrase_hash`);
--> statement-breakpoint
INSERT OR IGNORE INTO `users` (`id`, `seed_phrase_hash`, `created_at`) VALUES ('migrated', 'migrated-placeholder', 0);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL DEFAULT 'migrated',
	`api_key` text NOT NULL,
	`webhook_hmac_key` text,
	`storage_path` text DEFAULT '/data/images' NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_settings`("id", "user_id", "api_key", "webhook_hmac_key", "storage_path", "updated_at") SELECT "id", 'migrated', "api_key", "webhook_hmac_key", "storage_path", "updated_at" FROM `settings`;--> statement-breakpoint
DROP TABLE `settings`;--> statement-breakpoint
ALTER TABLE `__new_settings` RENAME TO `settings`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `tasks` ADD `user_id` text NOT NULL DEFAULT 'migrated';--> statement-breakpoint
ALTER TABLE `prompts` ADD `user_id` text NOT NULL DEFAULT 'migrated';