export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Role = "collector" | "recycler" | "authority";

const MATERIALS = ["cables", "batteries", "pcb", "panels", "motors", "plastics"] as const;
const DEFAULT_PRICES: Record<string, [number, number]> = {
  cables: [78, 96], batteries: [42, 60], pcb: [210, 285],
  panels: [24, 44], motors: [58, 82], plastics: [12, 24],
};

/* ─── In-memory store (used when Cloudflare D1 is unavailable, e.g. Vercel) ─── */

type MemProfile = { id: string; role: Role; display_name: string; contact: string; authorization_id: string | null; service_area: string; verified: number; created_at: string };
type MemLot = Record<string, unknown>;
type MemPrice = { material: string; low_rate: number; high_rate: number; source: string; updated_at: string; updated_by?: string };
type MemSupport = Record<string, unknown>;
type MemPriceHistory = Record<string, unknown>;

const mem = {
  profiles: [] as MemProfile[],
  lots: [] as MemLot[],
  prices: [] as MemPrice[],
  priceHistory: [] as MemPriceHistory[],
  clusterMembers: [] as { lot_id: string; cluster_id: string; joined_at: string }[],
  support: [] as MemSupport[],
  passportEvents: [] as Record<string, unknown>[],
  seeded: false,
};

function memSeedPrices() {
  if (mem.seeded) return;
  const now = new Date().toISOString();
  for (const [material, [low, high]] of Object.entries(DEFAULT_PRICES)) {
    if (!mem.prices.find((p) => p.material === material)) {
      mem.prices.push({ material, low_rate: low, high_rate: high, source: "JNARDDC reference baseline", updated_at: now });
    }
  }
  mem.seeded = true;
}

/* ─── Cloudflare D1 path ─── */

async function tryGetD1(): Promise<D1Database | null> {
  if (process.env.VERCEL) return null;
  try {
    const { env } = await import("cloudflare:workers");
    return (env as unknown as { DB?: D1Database }).DB ?? null;
  } catch {
    return null;
  }
}

// Demo access code used when no AUTHORITY_ACCESS_CODE is configured via
// Cloudflare bindings or process.env. Safe for the SIH prototype; a production
// deployment would always use a secret binding / env var instead.
const DEMO_AUTHORITY_ACCESS_CODE = "JNARDDC2026";

async function tryGetAuthorityCode(): Promise<string | undefined> {
  if (process.env.VERCEL) return process.env.AUTHORITY_ACCESS_CODE ?? DEMO_AUTHORITY_ACCESS_CODE;
  try {
    const { env } = await import("cloudflare:workers");
    return (env as unknown as { AUTHORITY_ACCESS_CODE?: string }).AUTHORITY_ACCESS_CODE ?? DEMO_AUTHORITY_ACCESS_CODE;
  } catch {
    return process.env.AUTHORITY_ACCESS_CODE ?? DEMO_AUTHORITY_ACCESS_CODE;
  }
}

/* ─── Shared helpers ─── */

function genId(prefix: string) {
  return `${prefix}-${crypto.randomUUID().split("-")[0].toUpperCase()}`;
}

function jsonResponse(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

function requiredText(value: unknown, field: string, max = 180) {
  const text = String(value ?? "").trim();
  if (!text) throw new Error(`${field} is required`);
  return text.slice(0, max);
}

function asLot(row: Record<string, unknown>) {
  return {
    id: row.id, collectorId: row.collector_id, material: row.material, weight: row.weight,
    condition: row.condition, location: row.location, createdAt: row.created_at,
    estimatedMin: row.estimated_min, estimatedMax: row.estimated_max, status: row.status,
    syncStatus: "synced", imageName: row.image_name, imageKey: row.image_key,
    aiConfidence: row.ai_confidence ?? 0, clusterJoined: Boolean(row.cluster_id), clusterId: row.cluster_id,
    selectedRecyclerId: row.recycler_id, lockedRate: row.locked_rate, fairLockId: row.fairlock_id,
    validUntil: row.valid_until, pickupDate: row.pickup_date, finalWeight: row.final_weight,
    finalRate: row.final_rate, paymentStatus: row.payment_status, handoverCode: row.handover_code,
    passportId: row.passport_id, completedAt: row.completed_at,
    priceChangeReason: row.price_change_reason, recyclerRating: row.recycler_rating,
    recyclerReview: row.recycler_review,
  };
}

/* ═══════════════════════════════════════════════════════════════════════════════
   D1 implementation (original Cloudflare path)
   ═══════════════════════════════════════════════════════════════════════════════ */

let d1TablesReady = false;

async function ensureD1Tables(db: D1Database) {
  if (d1TablesReady) return;
  try {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS cluster_members (
        lot_id TEXT PRIMARY KEY NOT NULL,
        cluster_id TEXT NOT NULL,
        joined_at TEXT NOT NULL
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
        ai_confidence REAL,
        estimated_min REAL NOT NULL,
        estimated_max REAL NOT NULL,
        status TEXT NOT NULL,
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
        updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS material_prices (
        material TEXT PRIMARY KEY NOT NULL,
        low_rate REAL NOT NULL,
        high_rate REAL NOT NULL,
        source TEXT NOT NULL,
        updated_by TEXT,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS passport_events (
        id TEXT PRIMARY KEY NOT NULL,
        passport_id TEXT NOT NULL,
        lot_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        actor_id TEXT NOT NULL,
        details TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS price_history (
        id TEXT PRIMARY KEY NOT NULL,
        material TEXT NOT NULL,
        low_rate REAL NOT NULL,
        high_rate REAL NOT NULL,
        source TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY NOT NULL,
        role TEXT NOT NULL,
        display_name TEXT NOT NULL,
        contact TEXT NOT NULL,
        authorization_id TEXT,
        service_area TEXT DEFAULT '' NOT NULL,
        verified INTEGER DEFAULT 0 NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS support_records (
        id TEXT PRIMARY KEY NOT NULL,
        profile_id TEXT NOT NULL,
        kind TEXT NOT NULL,
        rating INTEGER,
        contact TEXT,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'open' NOT NULL,
        created_at TEXT NOT NULL
      );
    `);
    d1TablesReady = true;
  } catch (err) {
    console.warn("ensureD1Tables failed:", err);
  }
}

async function seedPricesD1(db: D1Database) {
  await ensureD1Tables(db);
  const now = new Date().toISOString();
  await db.batch(Object.entries(DEFAULT_PRICES).map(([material, [low, high]]) => db.prepare(
    `INSERT OR IGNORE INTO material_prices (material, low_rate, high_rate, source, updated_at) VALUES (?, ?, ?, 'JNARDDC reference baseline', ?)`,
  ).bind(material, low, high, now)));
}

async function handleGetD1(db: D1Database, profileId: string) {
  await seedPricesD1(db);
  const profile = await db.prepare("SELECT * FROM profiles WHERE id = ?").bind(profileId).first<Record<string, unknown>>();
  if (!profile) return jsonResponse({ error: "Account not found. Please sign in again." }, 404);
  const role = profile.role as Role;
  let lotQuery = "SELECT * FROM lots ORDER BY created_at DESC";
  let lotParams: unknown[] = [];
  if (role === "collector") { lotQuery = "SELECT * FROM lots WHERE collector_id = ? ORDER BY created_at DESC"; lotParams = [profileId]; }
  else if (role === "recycler") { lotQuery = "SELECT * FROM lots WHERE status = 'available' OR recycler_id = ? ORDER BY created_at DESC"; lotParams = [profileId]; }
  const lotStmt = db.prepare(lotQuery);
  const lotRows = await (lotParams.length ? lotStmt.bind(...lotParams) : lotStmt).all<Record<string, unknown>>();
  const recyclerRows = await db.prepare("SELECT id, display_name, service_area, authorization_id, verified, created_at FROM profiles WHERE role = 'recycler' ORDER BY verified DESC, created_at DESC").all<Record<string, unknown>>();
  const priceRows = await db.prepare("SELECT * FROM material_prices ORDER BY material").all<Record<string, unknown>>();
  const historyRows = await db.prepare("SELECT * FROM price_history ORDER BY updated_at DESC LIMIT 60").all<Record<string, unknown>>();
  const clusterRows = await db.prepare(`SELECT cluster_id, material, location, COUNT(*) AS lot_count, ROUND(SUM(weight), 1) AS total_weight FROM lots WHERE cluster_id IS NOT NULL AND status != 'completed' GROUP BY cluster_id, material, location ORDER BY total_weight DESC`).all<Record<string, unknown>>();
  const supportRows = role === "authority" ? await db.prepare("SELECT * FROM support_records ORDER BY created_at DESC LIMIT 50").all<Record<string, unknown>>() : { results: [] as Record<string, unknown>[] };
  const metrics = await db.prepare(`SELECT COUNT(*) AS total_lots, COALESCE(SUM(weight), 0) AS total_kg, SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed, SUM(CASE WHEN cluster_id IS NOT NULL AND status != 'completed' THEN 1 ELSE 0 END) AS clustered FROM lots`).first<Record<string, unknown>>();
  return jsonResponse({
    profile: { id: profile.id, role, displayName: profile.display_name, contact: profile.contact, authorizationId: profile.authorization_id, serviceArea: profile.service_area, verified: Boolean(profile.verified) },
    lots: (lotRows.results ?? []).map(asLot),
    recyclers: (recyclerRows.results ?? []).map((row) => ({ id: row.id, name: row.display_name, serviceArea: row.service_area, authorizationId: row.authorization_id, verified: Boolean(row.verified) })),
    prices: (priceRows.results ?? []).map((row) => ({ material: row.material, low: row.low_rate, high: row.high_rate, source: row.source, updatedAt: row.updated_at })),
    priceHistory: historyRows.results ?? [], clusters: clusterRows.results ?? [], support: supportRows.results ?? [], metrics,
  });
}

async function handlePostD1(db: D1Database, body: Record<string, unknown>) {
  await seedPricesD1(db);
  const action = requiredText(body.action, "Action", 40);
  const now = new Date().toISOString();

  if (action === "register") {
    const role = body.role as Role;
    if (!["collector", "recycler", "authority"].includes(role)) throw new Error("Choose a valid workspace");
    const displayName = requiredText(body.displayName, "Name");
    const contact = requiredText(body.contact, "Mobile number or email").toLowerCase();
    const authorizationId = role === "collector" ? null : requiredText(body.authorizationId, "Authorization ID", 100);
    if (role === "authority") {
      const expected = await tryGetAuthorityCode();
      if (!expected) throw new Error("Command-center access has not been configured by the site owner");
      if (authorizationId !== expected) throw new Error("Invalid command-center access code");
    }
    const existing = await db.prepare("SELECT * FROM profiles WHERE role = ? AND contact = ?").bind(role, contact).first<Record<string, unknown>>();
    const profileId = String(existing?.id ?? genId(role === "collector" ? "COL" : role === "recycler" ? "REC" : "AUT"));
    const serviceArea = String(body.serviceArea ?? "").trim().slice(0, 120);
    if (existing) { await db.prepare("UPDATE profiles SET display_name = ?, authorization_id = ?, service_area = ? WHERE id = ?").bind(displayName, authorizationId, serviceArea, profileId).run(); }
    else { await db.prepare("INSERT INTO profiles (id, role, display_name, contact, authorization_id, service_area, verified, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind(profileId, role, displayName, contact, authorizationId, serviceArea, role === "authority" ? 1 : 0, now).run(); }
    return jsonResponse({ profile: { id: profileId, role, displayName, contact, authorizationId, serviceArea, verified: Boolean(existing?.verified) || role === "authority" } });
  }

  const profileId = requiredText(body.profileId, "Profile ID", 80);
  const profile = await db.prepare("SELECT * FROM profiles WHERE id = ?").bind(profileId).first<Record<string, unknown>>();
  if (!profile) throw new Error("Session expired. Please sign in again.");
  const role = profile.role as Role;

  if (action === "support") {
    const kind = requiredText(body.kind, "Request type", 40);
    const message = requiredText(body.message, "Message", 1000);
    const ratingValue = body.rating == null ? null : Number(body.rating);
    if (ratingValue !== null && (!Number.isInteger(ratingValue) || ratingValue < 1 || ratingValue > 5)) throw new Error("Choose a rating from 1 to 5");
    const supportId = genId("KQ");
    await db.prepare("INSERT INTO support_records (id, profile_id, kind, rating, contact, message, status, created_at) VALUES (?, ?, ?, ?, ?, ?, 'open', ?)").bind(supportId, profileId, kind, ratingValue, String(profile.contact ?? ""), message, now).run();
    return jsonResponse({ id: supportId });
  }

  if (action === "createLot") {
    if (role !== "collector") throw new Error("Only collectors can create lots");
    const material = requiredText(body.material, "Material", 30);
    if (!MATERIALS.includes(material as typeof MATERIALS[number])) throw new Error("Unsupported material category");
    const weight = Number(body.weight);
    if (!Number.isFinite(weight) || weight <= 0 || weight > 50000) throw new Error("Enter a valid weight");
    const condition = requiredText(body.condition, "Condition", 60);
    const location = requiredText(body.location, "Collection area", 120);
    const price = await db.prepare("SELECT low_rate, high_rate FROM material_prices WHERE material = ?").bind(material).first<{ low_rate: number; high_rate: number }>();
    if (!price) throw new Error("Price reference is unavailable for this material");
    const conditionFactor = condition === "Sorted" ? 1 : condition === "Mixed" ? 0.9 : 0.8;
    const lotId = genId("LOT");
    const estimatedMin = Math.round(price.low_rate * conditionFactor * weight);
    const estimatedMax = Math.round(price.high_rate * conditionFactor * weight);
    await db.prepare(`INSERT INTO lots (id, collector_id, material, weight, condition, location, image_key, image_name, ai_confidence, estimated_min, estimated_max, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available', ?, ?)`).bind(lotId, profileId, material, weight, condition, location, body.imageKey ?? null, String(body.imageName ?? "uploaded-image"), Number(body.aiConfidence ?? 0), estimatedMin, estimatedMax, now, now).run();
    const row = await db.prepare("SELECT * FROM lots WHERE id = ?").bind(lotId).first<Record<string, unknown>>();
    return jsonResponse({ lot: asLot(row!) }, 201);
  }

  if (action === "verifyRecycler") {
    if (role !== "authority") throw new Error("Command-center access is required");
    const recyclerId = requiredText(body.recyclerId, "Recycler ID", 80);
    await db.prepare("UPDATE profiles SET verified = ? WHERE id = ? AND role = 'recycler'").bind(body.verified ? 1 : 0, recyclerId).run();
    return jsonResponse({ ok: true });
  }

  if (action === "updatePrice") {
    if (role !== "authority") throw new Error("Command-center access is required");
    const material = requiredText(body.material, "Material", 30);
    const low = Number(body.low);
    const high = Number(body.high);
    const source = requiredText(body.source, "Price source", 180);
    if (!MATERIALS.includes(material as typeof MATERIALS[number]) || !Number.isFinite(low) || !Number.isFinite(high) || low <= 0 || high < low) throw new Error("Enter a valid material price range");
    await db.batch([
      db.prepare("UPDATE material_prices SET low_rate = ?, high_rate = ?, source = ?, updated_by = ?, updated_at = ? WHERE material = ?").bind(low, high, source, profileId, now, material),
      db.prepare("INSERT INTO price_history (id, material, low_rate, high_rate, source, updated_at) VALUES (?, ?, ?, ?, ?, ?)").bind(genId("PRC"), material, low, high, source, now),
    ]);
    return jsonResponse({ ok: true });
  }

  const lotId = requiredText(body.lotId, "Lot ID", 80);
  const lot = await db.prepare("SELECT * FROM lots WHERE id = ?").bind(lotId).first<Record<string, unknown>>();
  if (!lot) throw new Error("Lot not found");

  if (action === "joinCluster") {
    if (role !== "collector" || lot.collector_id !== profileId) throw new Error("This lot does not belong to your account");
    if (lot.status === "completed") throw new Error("Completed lots cannot join a pickup cluster");
    const area = String(lot.location).split(",")[0].trim();
    const existing = await db.prepare("SELECT cluster_id FROM lots WHERE material = ? AND cluster_id IS NOT NULL AND location LIKE ? AND status != 'completed' LIMIT 1").bind(lot.material, `${area}%`).first<{ cluster_id: string }>();
    const clusterId = existing?.cluster_id ?? genId("CLU");
    await db.prepare("UPDATE lots SET cluster_id = ?, updated_at = ? WHERE id = ?").bind(clusterId, now, lotId).run();
    await db.prepare("INSERT OR REPLACE INTO cluster_members (lot_id, cluster_id, joined_at) VALUES (?, ?, ?)").bind(lotId, clusterId, now).run();
    const summary = await db.prepare("SELECT COUNT(*) AS lot_count, ROUND(SUM(weight), 1) AS total_weight FROM lots WHERE cluster_id = ? AND status != 'completed'").bind(clusterId).first<Record<string, unknown>>();
    const updated = await db.prepare("SELECT * FROM lots WHERE id = ?").bind(lotId).first<Record<string, unknown>>();
    return jsonResponse({ lot: asLot(updated!), cluster: { id: clusterId, ...summary } });
  }

  if (action === "acceptLot") {
    if (role !== "recycler") throw new Error("Only recyclers can accept lots");
    if (!profile.verified) throw new Error("JNARDDC verification is required before accepting lots");
    if (lot.status !== "available") throw new Error("This lot is no longer available");
    const rate = Number(body.rate);
    if (!Number.isFinite(rate) || rate <= 0) throw new Error("Enter a valid offer rate");
    const fairLockId = genId("FL");
    const validUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await db.prepare("UPDATE lots SET recycler_id = ?, locked_rate = ?, fairlock_id = ?, valid_until = ?, status = 'locked', updated_at = ? WHERE id = ? AND status = 'available'").bind(profileId, rate, fairLockId, validUntil, now, lotId).run();
    const updated = await db.prepare("SELECT * FROM lots WHERE id = ?").bind(lotId).first<Record<string, unknown>>();
    return jsonResponse({ lot: asLot(updated!) });
  }

  if (action === "schedulePickup") {
    if (role !== "collector" || lot.collector_id !== profileId) throw new Error("Only the collector can schedule this pickup");
    if (!lot.recycler_id || !lot.fairlock_id) throw new Error("A recycler offer must be locked first");
    const pickupDate = requiredText(body.pickupDate, "Pickup date", 50);
    await db.prepare("UPDATE lots SET pickup_date = ?, status = 'scheduled', updated_at = ? WHERE id = ?").bind(pickupDate, now, lotId).run();
    const updated = await db.prepare("SELECT * FROM lots WHERE id = ?").bind(lotId).first<Record<string, unknown>>();
    return jsonResponse({ lot: asLot(updated!) });
  }

  if (action === "completeHandover") {
    if (role !== "recycler" || lot.recycler_id !== profileId) throw new Error("Only the assigned recycler can complete this handover");
    const finalWeight = Number(body.finalWeight);
    const finalRate = Number(body.finalRate);
    if (!Number.isFinite(finalWeight) || finalWeight <= 0 || !Number.isFinite(finalRate) || finalRate <= 0) throw new Error("Enter valid final weight and rate");
    const rateChanged = Number(lot.locked_rate) !== finalRate;
    const reason = String(body.priceChangeReason ?? "").trim();
    if (rateChanged && !reason) throw new Error("A reason is required when the locked rate changes");
    if (!body.collectorApproved) throw new Error("Collector approval is required for final values");
    const passportId = genId("DMP");
    const handoverCode = genId("KBS");
    const paymentStatus = requiredText(body.paymentStatus, "Payment status", 20);
    await db.prepare(`UPDATE lots SET final_weight = ?, final_rate = ?, payment_status = ?, handover_code = ?, passport_id = ?, completed_at = ?, price_change_reason = ?, status = 'completed', updated_at = ? WHERE id = ?`).bind(finalWeight, finalRate, paymentStatus, handoverCode, passportId, now, reason || null, now, lotId).run();
    const details = JSON.stringify({ material: lot.material, finalWeight, finalRate, paymentStatus, fairLockId: lot.fairlock_id });
    await db.prepare("INSERT INTO passport_events (id, passport_id, lot_id, event_type, actor_id, details, created_at) VALUES (?, ?, ?, 'verified_handover', ?, ?, ?)").bind(genId("EVT"), passportId, lotId, profileId, details, now).run();
    const updated = await db.prepare("SELECT * FROM lots WHERE id = ?").bind(lotId).first<Record<string, unknown>>();
    return jsonResponse({ lot: asLot(updated!) });
  }

  if (action === "rateRecycler") {
    if (role !== "collector" || lot.collector_id !== profileId || lot.status !== "completed") throw new Error("Only the collector can rate a completed handover");
    const rating = Number(body.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new Error("Choose a rating from 1 to 5");
    await db.prepare("UPDATE lots SET recycler_rating = ?, recycler_review = ?, updated_at = ? WHERE id = ?").bind(rating, String(body.review ?? "").trim().slice(0, 500), now, lotId).run();
    const updated = await db.prepare("SELECT * FROM lots WHERE id = ?").bind(lotId).first<Record<string, unknown>>();
    return jsonResponse({ lot: asLot(updated!) });
  }

  throw new Error("Unsupported action");
}

/* ═══════════════════════════════════════════════════════════════════════════════
   In-memory implementation (Vercel fallback)
   ═══════════════════════════════════════════════════════════════════════════════ */

function handleGetMem(profileId: string) {
  memSeedPrices();
  const profile = mem.profiles.find((p) => p.id === profileId);
  if (!profile) return jsonResponse({ error: "Account not found. Please sign in again." }, 404);
  const role = profile.role;
  let lots = mem.lots;
  if (role === "collector") lots = lots.filter((l) => l.collector_id === profileId);
  else if (role === "recycler") lots = lots.filter((l) => l.status === "available" || l.recycler_id === profileId);
  const recyclers = mem.profiles.filter((p) => p.role === "recycler").map((p) => ({ id: p.id, name: p.display_name, serviceArea: p.service_area, authorizationId: p.authorization_id, verified: Boolean(p.verified) }));
  const prices = mem.prices.map((p) => ({ material: p.material, low: p.low_rate, high: p.high_rate, source: p.source, updatedAt: p.updated_at }));
  const clusters: Record<string, unknown>[] = [];
  const clusterMap = new Map<string, { material: string; location: string; lot_count: number; total_weight: number }>();
  for (const lot of mem.lots) {
    if (lot.cluster_id && lot.status !== "completed") {
      const key = String(lot.cluster_id);
      const existing = clusterMap.get(key);
      if (existing) { existing.lot_count++; existing.total_weight += Number(lot.weight ?? 0); }
      else { clusterMap.set(key, { material: String(lot.material), location: String(lot.location), lot_count: 1, total_weight: Number(lot.weight ?? 0) }); }
    }
  }
  for (const [cid, data] of clusterMap) clusters.push({ cluster_id: cid, ...data, total_weight: Math.round(data.total_weight * 10) / 10 });
  const totalLots = mem.lots.length;
  const totalKg = mem.lots.reduce((s, l) => s + Number(l.weight ?? 0), 0);
  const completed = mem.lots.filter((l) => l.status === "completed").length;
  const clustered = mem.lots.filter((l) => l.cluster_id && l.status !== "completed").length;
  return jsonResponse({
    profile: { id: profile.id, role, displayName: profile.display_name, contact: profile.contact, authorizationId: profile.authorization_id, serviceArea: profile.service_area, verified: Boolean(profile.verified) },
    lots: lots.map(asLot), recyclers, prices, priceHistory: mem.priceHistory, clusters,
    support: role === "authority" ? mem.support : [],
    metrics: { total_lots: totalLots, total_kg: totalKg, completed, clustered },
  });
}

async function handlePostMem(body: Record<string, unknown>) {
  memSeedPrices();
  const action = requiredText(body.action, "Action", 40);
  const now = new Date().toISOString();

  if (action === "register") {
    const role = body.role as Role;
    if (!["collector", "recycler", "authority"].includes(role)) throw new Error("Choose a valid workspace");
    const displayName = requiredText(body.displayName, "Name");
    const contact = requiredText(body.contact, "Mobile number or email").toLowerCase();
    const authorizationId = role === "collector" ? null : requiredText(body.authorizationId, "Authorization ID", 100);
    if (role === "authority") {
      const expected = await tryGetAuthorityCode();
      if (!expected) throw new Error("Command-center access has not been configured by the site owner");
      if (authorizationId !== expected) throw new Error("Invalid command-center access code");
    }
    const existing = mem.profiles.find((p) => p.role === role && p.contact === contact);
    const profileId = existing?.id ?? genId(role === "collector" ? "COL" : role === "recycler" ? "REC" : "AUT");
    const serviceArea = String(body.serviceArea ?? "").trim().slice(0, 120);
    if (existing) { existing.display_name = displayName; existing.authorization_id = authorizationId; existing.service_area = serviceArea; }
    else { mem.profiles.push({ id: profileId, role, display_name: displayName, contact, authorization_id: authorizationId, service_area: serviceArea, verified: role === "authority" ? 1 : 0, created_at: now }); }
    return jsonResponse({ profile: { id: profileId, role, displayName, contact, authorizationId, serviceArea, verified: Boolean(existing?.verified) || role === "authority" } });
  }

  const profileId = requiredText(body.profileId, "Profile ID", 80);
  const profile = mem.profiles.find((p) => p.id === profileId);
  if (!profile) throw new Error("Session expired. Please sign in again.");
  const role = profile.role;

  if (action === "support") {
    const kind = requiredText(body.kind, "Request type", 40);
    const message = requiredText(body.message, "Message", 1000);
    const ratingValue = body.rating == null ? null : Number(body.rating);
    if (ratingValue !== null && (!Number.isInteger(ratingValue) || ratingValue < 1 || ratingValue > 5)) throw new Error("Choose a rating from 1 to 5");
    const supportId = genId("KQ");
    mem.support.push({ id: supportId, profile_id: profileId, kind, rating: ratingValue, contact: profile.contact, message, status: "open", created_at: now });
    return jsonResponse({ id: supportId });
  }

  if (action === "createLot") {
    if (role !== "collector") throw new Error("Only collectors can create lots");
    const material = requiredText(body.material, "Material", 30);
    if (!MATERIALS.includes(material as typeof MATERIALS[number])) throw new Error("Unsupported material category");
    const weight = Number(body.weight);
    if (!Number.isFinite(weight) || weight <= 0 || weight > 50000) throw new Error("Enter a valid weight");
    const condition = requiredText(body.condition, "Condition", 60);
    const location = requiredText(body.location, "Collection area", 120);
    const price = mem.prices.find((p) => p.material === material);
    if (!price) throw new Error("Price reference is unavailable for this material");
    const conditionFactor = condition === "Sorted" ? 1 : condition === "Mixed" ? 0.9 : 0.8;
    const lotId = genId("LOT");
    const estimatedMin = Math.round(price.low_rate * conditionFactor * weight);
    const estimatedMax = Math.round(price.high_rate * conditionFactor * weight);
    const newLot: MemLot = { id: lotId, collector_id: profileId, material, weight, condition, location, image_key: body.imageKey ?? null, image_name: String(body.imageName ?? "uploaded-image"), ai_confidence: Number(body.aiConfidence ?? 0), estimated_min: estimatedMin, estimated_max: estimatedMax, status: "available", created_at: now, updated_at: now, cluster_id: null, recycler_id: null, locked_rate: null, fairlock_id: null, valid_until: null, pickup_date: null, final_weight: null, final_rate: null, payment_status: null, handover_code: null, passport_id: null, completed_at: null, price_change_reason: null, recycler_rating: null, recycler_review: null };
    mem.lots.unshift(newLot);
    return jsonResponse({ lot: asLot(newLot) }, 201);
  }

  if (action === "verifyRecycler") {
    if (role !== "authority") throw new Error("Command-center access is required");
    const recyclerId = requiredText(body.recyclerId, "Recycler ID", 80);
    const target = mem.profiles.find((p) => p.id === recyclerId && p.role === "recycler");
    if (target) target.verified = body.verified ? 1 : 0;
    return jsonResponse({ ok: true });
  }

  if (action === "updatePrice") {
    if (role !== "authority") throw new Error("Command-center access is required");
    const material = requiredText(body.material, "Material", 30);
    const low = Number(body.low);
    const high = Number(body.high);
    const source = requiredText(body.source, "Price source", 180);
    if (!MATERIALS.includes(material as typeof MATERIALS[number]) || !Number.isFinite(low) || !Number.isFinite(high) || low <= 0 || high < low) throw new Error("Enter a valid material price range");
    const existing = mem.prices.find((p) => p.material === material);
    if (existing) { existing.low_rate = low; existing.high_rate = high; existing.source = source; existing.updated_by = profileId; existing.updated_at = now; }
    mem.priceHistory.unshift({ id: genId("PRC"), material, low_rate: low, high_rate: high, source, updated_at: now });
    return jsonResponse({ ok: true });
  }

  const lotId = requiredText(body.lotId, "Lot ID", 80);
  const lot = mem.lots.find((l) => l.id === lotId);
  if (!lot) throw new Error("Lot not found");

  if (action === "joinCluster") {
    if (role !== "collector" || lot.collector_id !== profileId) throw new Error("This lot does not belong to your account");
    if (lot.status === "completed") throw new Error("Completed lots cannot join a pickup cluster");
    const area = String(lot.location).split(",")[0].trim();
    const existing = mem.lots.find((l) => l.material === lot.material && l.cluster_id && String(l.location).startsWith(area) && l.status !== "completed");
    const clusterId = existing ? String(existing.cluster_id) : genId("CLU");
    lot.cluster_id = clusterId; lot.updated_at = now;
    const clusterLots = mem.lots.filter((l) => l.cluster_id === clusterId && l.status !== "completed");
    return jsonResponse({ lot: asLot(lot), cluster: { id: clusterId, lot_count: clusterLots.length, total_weight: Math.round(clusterLots.reduce((s, l) => s + Number(l.weight ?? 0), 0) * 10) / 10 } });
  }

  if (action === "acceptLot") {
    if (role !== "recycler") throw new Error("Only recyclers can accept lots");
    if (!profile.verified) throw new Error("JNARDDC verification is required before accepting lots");
    if (lot.status !== "available") throw new Error("This lot is no longer available");
    const rate = Number(body.rate);
    if (!Number.isFinite(rate) || rate <= 0) throw new Error("Enter a valid offer rate");
    lot.recycler_id = profileId; lot.locked_rate = rate; lot.fairlock_id = genId("FL");
    lot.valid_until = new Date(Date.now() + 86400000).toISOString(); lot.status = "locked"; lot.updated_at = now;
    return jsonResponse({ lot: asLot(lot) });
  }

  if (action === "schedulePickup") {
    if (role !== "collector" || lot.collector_id !== profileId) throw new Error("Only the collector can schedule this pickup");
    if (!lot.recycler_id || !lot.fairlock_id) throw new Error("A recycler offer must be locked first");
    lot.pickup_date = requiredText(body.pickupDate, "Pickup date", 50); lot.status = "scheduled"; lot.updated_at = now;
    return jsonResponse({ lot: asLot(lot) });
  }

  if (action === "completeHandover") {
    if (role !== "recycler" || lot.recycler_id !== profileId) throw new Error("Only the assigned recycler can complete this handover");
    const finalWeight = Number(body.finalWeight);
    const finalRate = Number(body.finalRate);
    if (!Number.isFinite(finalWeight) || finalWeight <= 0 || !Number.isFinite(finalRate) || finalRate <= 0) throw new Error("Enter valid final weight and rate");
    const rateChanged = Number(lot.locked_rate) !== finalRate;
    const reason = String(body.priceChangeReason ?? "").trim();
    if (rateChanged && !reason) throw new Error("A reason is required when the locked rate changes");
    if (!body.collectorApproved) throw new Error("Collector approval is required for final values");
    lot.final_weight = finalWeight; lot.final_rate = finalRate; lot.payment_status = requiredText(body.paymentStatus, "Payment status", 20);
    lot.handover_code = genId("KBS"); lot.passport_id = genId("DMP"); lot.completed_at = now;
    lot.price_change_reason = reason || null; lot.status = "completed"; lot.updated_at = now;
    return jsonResponse({ lot: asLot(lot) });
  }

  if (action === "rateRecycler") {
    if (role !== "collector" || lot.collector_id !== profileId || lot.status !== "completed") throw new Error("Only the collector can rate a completed handover");
    const rating = Number(body.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new Error("Choose a rating from 1 to 5");
    lot.recycler_rating = rating; lot.recycler_review = String(body.review ?? "").trim().slice(0, 500); lot.updated_at = now;
    return jsonResponse({ lot: asLot(lot) });
  }

  throw new Error("Unsupported action");
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Route handlers — automatically choose D1 or in-memory
   ═══════════════════════════════════════════════════════════════════════════════ */

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const profileId = requiredText(url.searchParams.get("profileId"), "Profile ID", 80);
    const db = await tryGetD1();
    if (db) {
      try {
        return await handleGetD1(db, profileId);
      } catch (err) {
        console.warn("D1 GET failed, falling back to memory store:", err);
        return handleGetMem(profileId);
      }
    }
    return handleGetMem(profileId);
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : "Unable to load platform data" }, 400);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const db = await tryGetD1();
    if (db) {
      try {
        return await handlePostD1(db, body);
      } catch (err) {
        console.warn("D1 POST failed, falling back to memory store:", err);
        return await handlePostMem(body);
      }
    }
    return await handlePostMem(body);
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : "Request failed" }, 400);
  }
}
