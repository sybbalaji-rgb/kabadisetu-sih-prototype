-- Migration: 001_initial_schema.sql
-- Description: Create initial tables for KabadiSetu platform

CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('collector', 'recycler', 'authority')),
    display_name TEXT NOT NULL,
    contact TEXT NOT NULL,
    authorization_id TEXT,
    service_area TEXT NOT NULL DEFAULT '',
    verified INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS material_prices (
    material TEXT PRIMARY KEY NOT NULL,
    low_rate REAL NOT NULL,
    high_rate REAL NOT NULL,
    source TEXT NOT NULL,
    updated_by TEXT,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS price_history (
    id TEXT PRIMARY KEY NOT NULL,
    material TEXT NOT NULL,
    low_rate REAL NOT NULL,
    high_rate REAL NOT NULL,
    source TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS lots (
    id TEXT PRIMARY KEY NOT NULL,
    collector_id TEXT NOT NULL,
    material TEXT NOT NULL,
    weight REAL NOT NULL,
    condition TEXT NOT NULL,
    location TEXT NOT NULL,
    image_key TEXT,
    image_name TEXT NOT NULL,
    ai_confidence REAL DEFAULT 0,
    estimated_min REAL NOT NULL,
    estimated_max REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'available',
    cluster_id TEXT,
    recycler_id TEXT,
    locked_rate REAL,
    fairlock_id TEXT,
    valid_until TEXT,
    pickup_date TEXT,
    final_weight REAL,
    final_rate REAL,
    payment_status TEXT,
    handover_code TEXT,
    passport_id TEXT,
    completed_at TEXT,
    price_change_reason TEXT,
    recycler_rating INTEGER,
    recycler_review TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (collector_id) REFERENCES profiles(id),
    FOREIGN KEY (recycler_id) REFERENCES profiles(id)
);

CREATE TABLE IF NOT EXISTS cluster_members (
    lot_id TEXT PRIMARY KEY NOT NULL,
    cluster_id TEXT NOT NULL,
    joined_at TEXT NOT NULL,
    FOREIGN KEY (lot_id) REFERENCES lots(id)
);

CREATE TABLE IF NOT EXISTS passport_events (
    id TEXT PRIMARY KEY NOT NULL,
    passport_id TEXT NOT NULL,
    lot_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    actor_id TEXT NOT NULL,
    details TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (lot_id) REFERENCES lots(id),
    FOREIGN KEY (actor_id) REFERENCES profiles(id)
);

CREATE TABLE IF NOT EXISTS support_records (
    id TEXT PRIMARY KEY NOT NULL,
    profile_id TEXT NOT NULL,
    kind TEXT NOT NULL,
    rating INTEGER,
    contact TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    created_at TEXT NOT NULL,
    FOREIGN KEY (profile_id) REFERENCES profiles(id)
);
