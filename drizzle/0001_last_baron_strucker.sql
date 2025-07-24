CREATE TABLE `artifacts` (
	`id` text PRIMARY KEY NOT NULL,
	`video_id` text NOT NULL,
	`type` text NOT NULL,
	`r2_key` text NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`video_id`) REFERENCES `videos`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `videos` (
	`id` text PRIMARY KEY NOT NULL,
	`filename` text NOT NULL,
	`duration` integer NOT NULL,
	`r2_key` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
