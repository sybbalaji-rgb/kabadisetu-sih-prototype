CREATE TABLE `cluster_members` (
	`lot_id` text PRIMARY KEY NOT NULL,
	`cluster_id` text NOT NULL,
	`joined_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `lots` (
	`id` text PRIMARY KEY NOT NULL,
	`collector_id` text NOT NULL,
	`material` text NOT NULL,
	`weight` real NOT NULL,
	`condition` text NOT NULL,
	`location` text NOT NULL,
	`image_key` text,
	`image_name` text NOT NULL,
	`ai_confidence` real,
	`estimated_min` real NOT NULL,
	`estimated_max` real NOT NULL,
	`status` text NOT NULL,
	`cluster_id` text,
	`recycler_id` text,
	`locked_rate` real,
	`fairlock_id` text,
	`valid_until` text,
	`pickup_date` text,
	`final_weight` real,
	`final_rate` real,
	`payment_status` text,
	`handover_code` text,
	`passport_id` text,
	`completed_at` text,
	`price_change_reason` text,
	`recycler_rating` integer,
	`recycler_review` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `material_prices` (
	`material` text PRIMARY KEY NOT NULL,
	`low_rate` real NOT NULL,
	`high_rate` real NOT NULL,
	`source` text NOT NULL,
	`updated_by` text,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `passport_events` (
	`id` text PRIMARY KEY NOT NULL,
	`passport_id` text NOT NULL,
	`lot_id` text NOT NULL,
	`event_type` text NOT NULL,
	`actor_id` text NOT NULL,
	`details` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `price_history` (
	`id` text PRIMARY KEY NOT NULL,
	`material` text NOT NULL,
	`low_rate` real NOT NULL,
	`high_rate` real NOT NULL,
	`source` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`role` text NOT NULL,
	`display_name` text NOT NULL,
	`contact` text NOT NULL,
	`authorization_id` text,
	`service_area` text DEFAULT '' NOT NULL,
	`verified` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `support_records` (
	`id` text PRIMARY KEY NOT NULL,
	`profile_id` text NOT NULL,
	`kind` text NOT NULL,
	`rating` integer,
	`contact` text,
	`message` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`created_at` text NOT NULL
);
