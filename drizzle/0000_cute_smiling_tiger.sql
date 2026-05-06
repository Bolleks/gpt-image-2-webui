CREATE TABLE `prompts` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`category` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` text PRIMARY KEY DEFAULT 'default' NOT NULL,
	`api_key` text NOT NULL,
	`webhook_hmac_key` text,
	`storage_path` text DEFAULT '/data/images' NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`prompt` text NOT NULL,
	`aspect_ratio` text NOT NULL,
	`resolution` text NOT NULL,
	`status` text DEFAULT 'waiting' NOT NULL,
	`result_url` text,
	`local_path` text,
	`input_urls` text,
	`fail_code` text,
	`fail_msg` text,
	`cost_time` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`completed_at` integer
);
