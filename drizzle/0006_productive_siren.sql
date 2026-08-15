CREATE TABLE `link_create_counters` (
	`owner_id` text NOT NULL,
	`counter_type` text NOT NULL,
	`window_start` integer NOT NULL,
	`window_seconds` integer NOT NULL,
	`count` integer NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`owner_id`, `counter_type`)
);
--> statement-breakpoint
CREATE INDEX `link_create_counters_updated_at_idx` ON `link_create_counters` (`updated_at`);
