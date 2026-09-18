CREATE TABLE `pickup_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`full_name` text NOT NULL,
	`mobile` text NOT NULL,
	`email` text,
	`address` text NOT NULL,
	`city` text NOT NULL,
	`category` text NOT NULL,
	`weight` real NOT NULL,
	`pickup_date` text NOT NULL,
	`time_slot` text NOT NULL,
	`image_key` text,
	`notes` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text NOT NULL
);
