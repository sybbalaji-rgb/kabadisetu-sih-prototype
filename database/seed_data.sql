-- ==============================================================================
-- KabadiSetu Database Seed Data
-- Smart India Hackathon 2026 | Problem Statement: SIH26229
-- ==============================================================================

-- Baseline Material Prices (CPCB / JNARDDC Reference Standards)
INSERT INTO material_prices (material, low_rate, high_rate, source, updated_by, updated_at) VALUES
('cables', 78.0, 96.0, 'JNARDDC reference baseline', 'AUT-JNARDDC', datetime('now')),
('batteries', 42.0, 60.0, 'JNARDDC reference baseline', 'AUT-JNARDDC', datetime('now')),
('pcb', 210.0, 285.0, 'JNARDDC reference baseline', 'AUT-JNARDDC', datetime('now')),
('panels', 24.0, 44.0, 'JNARDDC reference baseline', 'AUT-JNARDDC', datetime('now')),
('motors', 58.0, 82.0, 'JNARDDC reference baseline', 'AUT-JNARDDC', datetime('now')),
('plastics', 12.0, 24.0, 'JNARDDC reference baseline', 'AUT-JNARDDC', datetime('now'))
ON CONFLICT (material) DO UPDATE SET
    low_rate = EXCLUDED.low_rate,
    high_rate = EXCLUDED.high_rate,
    updated_at = EXCLUDED.updated_at;

-- Regulatory Authority Account
INSERT INTO profiles (id, role, display_name, contact, authorization_id, service_area, verified, created_at) VALUES
('AUT-JNARDDC', 'authority', 'JNARDDC Authority Officer', 'compliance@jnarddc.gov.in', 'JNARDDC2026', 'Maharashtra & Central India', 1, datetime('now'))
ON CONFLICT (id) DO NOTHING;

-- Registered Recyclers (Pre-vetted formal processing plants)
INSERT INTO profiles (id, role, display_name, contact, authorization_id, service_area, verified, created_at) VALUES
('REC-GREENLOOP', 'recycler', 'GreenLoop E-Waste Reprocessors', 'contact@greenloop.in', 'CPCB-REC-2024-089', 'Pimpri-Chinchwad & Pune West', 1, datetime('now')),
('REC-ECOCYCLE', 'recycler', 'EcoCycle Metals & Smelting', 'ops@ecocycle.org', 'CPCB-REC-2023-412', 'Pune East & Hadapsar MIDC', 1, datetime('now')),
('REC-URBANMINE', 'recycler', 'UrbanMine Circular Resources', 'procurement@urbanmine.in', 'CPCB-REC-2025-119', 'Chakan Industrial Corridor', 1, datetime('now'))
ON CONFLICT (id) DO NOTHING;

-- Sample Informal Collector
INSERT INTO profiles (id, role, display_name, contact, authorization_id, service_area, verified, created_at) VALUES
('COL-RAVI001', 'collector', 'Ravi Kumar (Informal Aggregator)', '+919876543210', NULL, 'Pimpri, Pune', 0, datetime('now'))
ON CONFLICT (id) DO NOTHING;

-- Verified Sample Scrap Lots & Completed Material Passports
INSERT INTO lots (
    id, collector_id, material, weight, condition, location, image_name, ai_confidence,
    estimated_min, estimated_max, status, recycler_id, locked_rate, fairlock_id,
    valid_until, pickup_date, final_weight, final_rate, payment_status, handover_code,
    passport_id, completed_at, recycler_rating, recycler_review, created_at, updated_at
) VALUES
('LOT-2214', 'COL-RAVI001', 'cables', 8.0, 'Sorted', 'Pimpri, Pune', 'cable-lot.jpg', 91.0,
 624.0, 768.0, 'completed', 'REC-GREENLOOP', 92.0, 'FL-7421',
 datetime('now', '+7 days'), '2026-08-27', 8.1, 92.0, 'paid', 'KBS-9142',
 'DMP-8821', datetime('now', '-2 days'), 5, 'Quick verification and instant UPI payment.', datetime('now', '-5 days'), datetime('now', '-2 days')),
('LOT-2287', 'COL-RAVI001', 'pcb', 4.5, 'Sorted', 'Kasarwadi, Pune', 'motherboard.jpg', 94.0,
 945.0, 1282.0, 'locked', 'REC-ECOCYCLE', 270.0, 'FL-8109',
 datetime('now', '+5 days'), '2026-09-18', NULL, NULL, 'pending', NULL,
 NULL, NULL, NULL, NULL, datetime('now', '-1 days'), datetime('now', '-1 days'))
ON CONFLICT (id) DO NOTHING;

-- Initial Passport Event for LOT-2214
INSERT INTO passport_events (id, passport_id, lot_id, event_type, actor_id, details, created_at) VALUES
('EVT-001', 'DMP-8821', 'LOT-2214', 'verified_handover', 'REC-GREENLOOP', '{"material":"cables","finalWeight":8.1,"finalRate":92.0,"paymentStatus":"paid","fairLockId":"FL-7421"}', datetime('now', '-2 days'))
ON CONFLICT (id) DO NOTHING;
