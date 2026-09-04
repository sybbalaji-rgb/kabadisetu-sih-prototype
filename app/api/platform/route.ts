type Role = "collector" | "recycler" | "authority";
type D1 = D1Database;

const MATERIALS = ["cables", "batteries", "pcb", "panels", "motors", "plastics"] as const;
const DEFAULT_PRICES: Record<string, [number, number]> = {
  cables: [78, 96], batteries: [42, 60], pcb: [210, 285],
  panels: [24, 44], motors: [58, 82], plastics: [12, 24],
};

async function bindings() {
  return (await import("cloudflare:workers")).env as unknown as { DB?: D1; AUTHORITY_ACCESS_CODE?: string };
}

async function database(): Promise<D1> {
  const db = (await bindings()).DB;
  if (!db) throw new Error("Database binding is not available");
  return db;
}

function id(prefix: string) {
  return `${prefix}-${crypto.randomUUID().split("-")[0].toUpperCase()}`;
}

function response(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

function requiredText(value: unknown, field: string, max = 180) {
  const text = String(value ?? "").trim();
  if (!text) throw new Error(`${field} is required`);
  return text.slice(0, max);
}

async function seedPrices(db: D1) {
  const now = new Date().toISOString();
  await db.batch(Object.entries(DEFAULT_PRICES).map(([material, [low, high]]) => db.prepare(
    `INSERT OR IGNORE INTO material_prices
      (material, low_rate, high_rate, source, updated_at)
      VALUES (?, ?, ?, 'JNARDDC reference baseline', ?)`,
  ).bind(material, low, high, now)));
}

async function getProfile(db: D1, profileId: string) {
  return db.prepare("SELECT * FROM profiles WHERE id = ?").bind(profileId).first<Record<string, unknown>>();
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

export async function GET(request: Request) {
  try {
    const db = await database();
    await seedPrices(db);
    const url = new URL(request.url);
    const profileId = requiredText(url.searchParams.get("profileId"), "Profile ID", 80);
    const profile = await getProfile(db, profileId);
    if (!profile) return response({ error: "Account not found. Please sign in again." }, 404);
    const role = profile.role as Role;
    let lotQuery = "SELECT * FROM lots ORDER BY created_at DESC";
    let lotParams: unknown[] = [];
    if (role === "collector") {
      lotQuery = "SELECT * FROM lots WHERE collector_id = ? ORDER BY created_at DESC";
      lotParams = [profileId];
    } else if (role === "recycler") {
      lotQuery = "SELECT * FROM lots WHERE status = 'available' OR recycler_id = ? ORDER BY created_at DESC";
      lotParams = [profileId];
    }
    const lotStatement = db.prepare(lotQuery);
    const lotRows = await (lotParams.length ? lotStatement.bind(...lotParams) : lotStatement).all<Record<string, unknown>>();
    const recyclerRows = await db.prepare(
      "SELECT id, display_name, service_area, authorization_id, verified, created_at FROM profiles WHERE role = 'recycler' ORDER BY verified DESC, created_at DESC",
    ).all<Record<string, unknown>>();
    const priceRows = await db.prepare("SELECT * FROM material_prices ORDER BY material").all<Record<string, unknown>>();
    const historyRows = await db.prepare("SELECT * FROM price_history ORDER BY updated_at DESC LIMIT 60").all<Record<string, unknown>>();
    const clusterRows = await db.prepare(
      `SELECT cluster_id, material, location, COUNT(*) AS lot_count, ROUND(SUM(weight), 1) AS total_weight
       FROM lots WHERE cluster_id IS NOT NULL AND status != 'completed'
       GROUP BY cluster_id, material, location ORDER BY total_weight DESC`,
    ).all<Record<string, unknown>>();
    const supportRows = role === "authority"
      ? await db.prepare("SELECT * FROM support_records ORDER BY created_at DESC LIMIT 50").all<Record<string, unknown>>()
      : { results: [] as Record<string, unknown>[] };
    const metrics = await db.prepare(
      `SELECT COUNT(*) AS total_lots, COALESCE(SUM(weight), 0) AS total_kg,
       SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed,
       SUM(CASE WHEN cluster_id IS NOT NULL AND status != 'completed' THEN 1 ELSE 0 END) AS clustered
       FROM lots`,
    ).first<Record<string, unknown>>();
    return response({
      profile: {
        id: profile.id, role, displayName: profile.display_name, contact: profile.contact,
        authorizationId: profile.authorization_id, serviceArea: profile.service_area,
        verified: Boolean(profile.verified),
      },
      lots: (lotRows.results ?? []).map(asLot),
      recyclers: (recyclerRows.results ?? []).map((row) => ({
        id: row.id, name: row.display_name, serviceArea: row.service_area,
        authorizationId: row.authorization_id, verified: Boolean(row.verified),
      })),
      prices: (priceRows.results ?? []).map((row) => ({
        material: row.material, low: row.low_rate, high: row.high_rate,
        source: row.source, updatedAt: row.updated_at,
      })),
      priceHistory: historyRows.results ?? [], clusters: clusterRows.results ?? [],
      support: supportRows.results ?? [], metrics,
    });
  } catch (error) {
    return response({ error: error instanceof Error ? error.message : "Unable to load platform data" }, 400);
  }
}

export async function POST(request: Request) {
  try {
    const db = await database();
    await seedPrices(db);
    const body = await request.json() as Record<string, unknown>;
    const action = requiredText(body.action, "Action", 40);
    const now = new Date().toISOString();

    if (action === "register") {
      const role = body.role as Role;
      if (!["collector", "recycler", "authority"].includes(role)) throw new Error("Choose a valid workspace");
      const displayName = requiredText(body.displayName, "Name");
      const contact = requiredText(body.contact, "Mobile number or email").toLowerCase();
      const authorizationId = role === "collector" ? null : requiredText(body.authorizationId, "Authorization ID", 100);
      if (role === "authority") {
        const expected = (await bindings()).AUTHORITY_ACCESS_CODE;
        if (!expected) throw new Error("Command-center access has not been configured by the site owner");
        if (authorizationId !== expected) throw new Error("Invalid command-center access code");
      }
      const existing = await db.prepare("SELECT * FROM profiles WHERE role = ? AND contact = ?")
        .bind(role, contact).first<Record<string, unknown>>();
      const profileId = String(existing?.id ?? id(role === "collector" ? "COL" : role === "recycler" ? "REC" : "AUT"));
      const serviceArea = String(body.serviceArea ?? "").trim().slice(0, 120);
      if (existing) {
        await db.prepare("UPDATE profiles SET display_name = ?, authorization_id = ?, service_area = ? WHERE id = ?")
          .bind(displayName, authorizationId, serviceArea, profileId).run();
      } else {
        await db.prepare(
          "INSERT INTO profiles (id, role, display_name, contact, authorization_id, service_area, verified, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        ).bind(profileId, role, displayName, contact, authorizationId, serviceArea, role === "authority" ? 1 : 0, now).run();
      }
      return response({ profile: { id: profileId, role, displayName, contact, authorizationId, serviceArea, verified: Boolean(existing?.verified) || role === "authority" } });
    }

    const profileId = requiredText(body.profileId, "Profile ID", 80);
    const profile = await getProfile(db, profileId);
    if (!profile) throw new Error("Session expired. Please sign in again.");
    const role = profile.role as Role;

    if (action === "support") {
      const kind = requiredText(body.kind, "Request type", 40);
      const message = requiredText(body.message, "Message", 1000);
      const ratingValue = body.rating == null ? null : Number(body.rating);
      if (ratingValue !== null && (!Number.isInteger(ratingValue) || ratingValue < 1 || ratingValue > 5)) throw new Error("Choose a rating from 1 to 5");
      const supportId = id("KQ");
      await db.prepare(
        "INSERT INTO support_records (id, profile_id, kind, rating, contact, message, status, created_at) VALUES (?, ?, ?, ?, ?, ?, 'open', ?)",
      ).bind(supportId, profileId, kind, ratingValue, String(profile.contact ?? ""), message, now).run();
      return response({ id: supportId });
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
      const lotId = id("LOT");
      const estimatedMin = Math.round(price.low_rate * conditionFactor * weight);
      const estimatedMax = Math.round(price.high_rate * conditionFactor * weight);
      await db.prepare(
        `INSERT INTO lots (id, collector_id, material, weight, condition, location, image_key, image_name,
          ai_confidence, estimated_min, estimated_max, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available', ?, ?)`,
      ).bind(lotId, profileId, material, weight, condition, location, body.imageKey ?? null,
        String(body.imageName ?? "uploaded-image"), Number(body.aiConfidence ?? 0), estimatedMin, estimatedMax, now, now).run();
      const row = await db.prepare("SELECT * FROM lots WHERE id = ?").bind(lotId).first<Record<string, unknown>>();
      return response({ lot: asLot(row!) }, 201);
    }

    const lotId = requiredText(body.lotId, "Lot ID", 80);
    const lot = await db.prepare("SELECT * FROM lots WHERE id = ?").bind(lotId).first<Record<string, unknown>>();
    if (!lot) throw new Error("Lot not found");

    if (action === "joinCluster") {
      if (role !== "collector" || lot.collector_id !== profileId) throw new Error("This lot does not belong to your account");
      if (lot.status === "completed") throw new Error("Completed lots cannot join a pickup cluster");
      const area = String(lot.location).split(",")[0].trim();
      const existing = await db.prepare(
        "SELECT cluster_id FROM lots WHERE material = ? AND cluster_id IS NOT NULL AND location LIKE ? AND status != 'completed' LIMIT 1",
      ).bind(lot.material, `${area}%`).first<{ cluster_id: string }>();
      const clusterId = existing?.cluster_id ?? id("CLU");
      await db.prepare("UPDATE lots SET cluster_id = ?, updated_at = ? WHERE id = ?").bind(clusterId, now, lotId).run();
      await db.prepare("INSERT OR REPLACE INTO cluster_members (lot_id, cluster_id, joined_at) VALUES (?, ?, ?)").bind(lotId, clusterId, now).run();
      const summary = await db.prepare("SELECT COUNT(*) AS lot_count, ROUND(SUM(weight), 1) AS total_weight FROM lots WHERE cluster_id = ? AND status != 'completed'")
        .bind(clusterId).first<Record<string, unknown>>();
      const updated = await db.prepare("SELECT * FROM lots WHERE id = ?").bind(lotId).first<Record<string, unknown>>();
      return response({ lot: asLot(updated!), cluster: { id: clusterId, ...summary } });
    }

    if (action === "acceptLot") {
      if (role !== "recycler") throw new Error("Only recyclers can accept lots");
      if (!profile.verified) throw new Error("JNARDDC verification is required before accepting lots");
      if (lot.status !== "available") throw new Error("This lot is no longer available");
      const rate = Number(body.rate);
      if (!Number.isFinite(rate) || rate <= 0) throw new Error("Enter a valid offer rate");
      const fairLockId = id("FL");
      const validUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      await db.prepare(
        "UPDATE lots SET recycler_id = ?, locked_rate = ?, fairlock_id = ?, valid_until = ?, status = 'locked', updated_at = ? WHERE id = ? AND status = 'available'",
      ).bind(profileId, rate, fairLockId, validUntil, now, lotId).run();
      const updated = await db.prepare("SELECT * FROM lots WHERE id = ?").bind(lotId).first<Record<string, unknown>>();
      return response({ lot: asLot(updated!) });
    }

    if (action === "schedulePickup") {
      if (role !== "collector" || lot.collector_id !== profileId) throw new Error("Only the collector can schedule this pickup");
      if (!lot.recycler_id || !lot.fairlock_id) throw new Error("A recycler offer must be locked first");
      const pickupDate = requiredText(body.pickupDate, "Pickup date", 50);
      await db.prepare("UPDATE lots SET pickup_date = ?, status = 'scheduled', updated_at = ? WHERE id = ?")
        .bind(pickupDate, now, lotId).run();
      const updated = await db.prepare("SELECT * FROM lots WHERE id = ?").bind(lotId).first<Record<string, unknown>>();
      return response({ lot: asLot(updated!) });
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
      const passportId = id("DMP");
      const handoverCode = id("KBS");
      const paymentStatus = requiredText(body.paymentStatus, "Payment status", 20);
      await db.prepare(
        `UPDATE lots SET final_weight = ?, final_rate = ?, payment_status = ?, handover_code = ?, passport_id = ?,
         completed_at = ?, price_change_reason = ?, status = 'completed', updated_at = ? WHERE id = ?`,
      ).bind(finalWeight, finalRate, paymentStatus, handoverCode, passportId, now, reason || null, now, lotId).run();
      const details = JSON.stringify({ material: lot.material, finalWeight, finalRate, paymentStatus, fairLockId: lot.fairlock_id });
      await db.prepare(
        "INSERT INTO passport_events (id, passport_id, lot_id, event_type, actor_id, details, created_at) VALUES (?, ?, ?, 'verified_handover', ?, ?, ?)",
      ).bind(id("EVT"), passportId, lotId, profileId, details, now).run();
      const updated = await db.prepare("SELECT * FROM lots WHERE id = ?").bind(lotId).first<Record<string, unknown>>();
      return response({ lot: asLot(updated!) });
    }

    if (action === "rateRecycler") {
      if (role !== "collector" || lot.collector_id !== profileId || lot.status !== "completed") throw new Error("Only the collector can rate a completed handover");
      const rating = Number(body.rating);
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new Error("Choose a rating from 1 to 5");
      await db.prepare("UPDATE lots SET recycler_rating = ?, recycler_review = ?, updated_at = ? WHERE id = ?")
        .bind(rating, String(body.review ?? "").trim().slice(0, 500), now, lotId).run();
      const updated = await db.prepare("SELECT * FROM lots WHERE id = ?").bind(lotId).first<Record<string, unknown>>();
      return response({ lot: asLot(updated!) });
    }

    if (action === "verifyRecycler") {
      if (role !== "authority") throw new Error("Command-center access is required");
      const recyclerId = requiredText(body.recyclerId, "Recycler ID", 80);
      await db.prepare("UPDATE profiles SET verified = ? WHERE id = ? AND role = 'recycler'")
        .bind(body.verified ? 1 : 0, recyclerId).run();
      return response({ ok: true });
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
        db.prepare("INSERT INTO price_history (id, material, low_rate, high_rate, source, updated_at) VALUES (?, ?, ?, ?, ?, ?)").bind(id("PRC"), material, low, high, source, now),
      ]);
      return response({ ok: true });
    }

    throw new Error("Unsupported action");
  } catch (error) {
    return response({ error: error instanceof Error ? error.message : "Request failed" }, 400);
  }
}
