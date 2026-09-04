import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const profiles = sqliteTable("profiles", {
  id: text("id").primaryKey(),
  role: text("role", { enum: ["collector", "recycler", "authority"] }).notNull(),
  displayName: text("display_name").notNull(),
  contact: text("contact").notNull(),
  authorizationId: text("authorization_id"),
  serviceArea: text("service_area").notNull().default(""),
  verified: integer("verified", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
});

export const materialPrices = sqliteTable("material_prices", {
  material: text("material").primaryKey(),
  lowRate: real("low_rate").notNull(),
  highRate: real("high_rate").notNull(),
  source: text("source").notNull(),
  updatedBy: text("updated_by"),
  updatedAt: text("updated_at").notNull(),
});

export const priceHistory = sqliteTable("price_history", {
  id: text("id").primaryKey(),
  material: text("material").notNull(),
  lowRate: real("low_rate").notNull(),
  highRate: real("high_rate").notNull(),
  source: text("source").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const lots = sqliteTable("lots", {
  id: text("id").primaryKey(),
  collectorId: text("collector_id").notNull(),
  material: text("material").notNull(),
  weight: real("weight").notNull(),
  condition: text("condition").notNull(),
  location: text("location").notNull(),
  imageKey: text("image_key"),
  imageName: text("image_name").notNull(),
  aiConfidence: real("ai_confidence"),
  estimatedMin: real("estimated_min").notNull(),
  estimatedMax: real("estimated_max").notNull(),
  status: text("status").notNull(),
  clusterId: text("cluster_id"),
  recyclerId: text("recycler_id"),
  lockedRate: real("locked_rate"),
  fairLockId: text("fairlock_id"),
  validUntil: text("valid_until"),
  pickupDate: text("pickup_date"),
  finalWeight: real("final_weight"),
  finalRate: real("final_rate"),
  paymentStatus: text("payment_status"),
  handoverCode: text("handover_code"),
  passportId: text("passport_id"),
  completedAt: text("completed_at"),
  priceChangeReason: text("price_change_reason"),
  recyclerRating: integer("recycler_rating"),
  recyclerReview: text("recycler_review"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const clusterMembers = sqliteTable("cluster_members", {
  lotId: text("lot_id").primaryKey(),
  clusterId: text("cluster_id").notNull(),
  joinedAt: text("joined_at").notNull(),
});

export const passportEvents = sqliteTable("passport_events", {
  id: text("id").primaryKey(),
  passportId: text("passport_id").notNull(),
  lotId: text("lot_id").notNull(),
  eventType: text("event_type").notNull(),
  actorId: text("actor_id").notNull(),
  details: text("details").notNull(),
  createdAt: text("created_at").notNull(),
});

export const supportRecords = sqliteTable("support_records", {
  id: text("id").primaryKey(),
  profileId: text("profile_id").notNull(),
  kind: text("kind").notNull(),
  rating: integer("rating"),
  contact: text("contact"),
  message: text("message").notNull(),
  status: text("status").notNull().default("open"),
  createdAt: text("created_at").notNull(),
});
