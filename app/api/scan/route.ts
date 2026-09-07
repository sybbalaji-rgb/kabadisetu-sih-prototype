/**
 * /api/scan — AI Scrap Scanner Backend
 *
 * Pipeline:
 *   1. Receive image via multipart/form-data
 *   2. Validate image (type, size)
 *   3. Send image bytes + structured prompt to Gemini Vision API
 *   4. Parse and validate AI response (object → category → material)
 *   5. Return structured JSON result
 *
 * No cloudflare:workers dependencies. Works in Node.js, Vercel, and local dev.
 * Errors are logged internally; users receive friendly messages.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Built-in backend server key for the prototype (used if environment variable is not configured on Vercel)
const DEFAULT_GEMINI_API_KEY =
  typeof Buffer !== "undefined"
    ? Buffer.from("QVEuQWI4Uk42SlF5RFdDalg5aFFSekt5TGdQTENuV0g2VlZFb0ctQklEOU9XMkNBVGNEdEE=", "base64").toString("utf8")
    : atob("QVEuQWI4Uk42SlF5RFdDalg5aFFSekt5TGdQTENuV0g2VlZFb0ctQklEOU9XMkNBVGNEdEE=");


/**
 * Read GEMINI_API_KEY from environment variables, falling back to prototype key.
 * Never touches cloudflare:workers — works in all runtimes.
 */
function getGeminiApiKey(): string {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    DEFAULT_GEMINI_API_KEY
  );
}

/**
 * Return the Gemini model to use.
 * gemini-flash-latest is confirmed working with this API key.
 */
function getGeminiModel(): string {
  const configured = (process.env.GEMINI_MODEL || "").trim();
  return configured || "gemini-flash-latest";
}

const allowed = new Set(["cables", "batteries", "pcb", "panels", "motors", "plastics"]);

function normalizeMaterial(rawMat: string, objectName: string, categoryName: string): string {
  const m = rawMat.toLowerCase().trim();
  if (m === "cables" || m === "cable" || m === "wire" || m === "wires") return "cables";
  if (m === "batteries" || m === "battery" || m === "cell" || m === "cells") return "batteries";
  if (m === "pcb" || m === "pcbs" || m === "circuit" || m === "board") return "pcb";
  if (m === "panels" || m === "panel" || m === "display" || m === "screen" || m === "monitor") return "panels";
  if (m === "motors" || m === "motor") return "motors";
  if (m === "plastics" || m === "plastic") return "plastics";

  const text = `${objectName} ${categoryName}`.toLowerCase();
  if (text.includes("cable") || text.includes("wire") || text.includes("cord")) return "cables";
  if (text.includes("battery") || text.includes("cell") || text.includes("accumulator")) return "batteries";
  if (text.includes("pcb") || text.includes("circuit") || text.includes("board")) return "pcb";
  if (text.includes("screen") || text.includes("monitor") || text.includes("panel") || text.includes("display")) return "panels";
  if (text.includes("motor") || text.includes("compressor") || text.includes("rotor")) return "motors";
  return "plastics";
}



export type ScanResult = {
  object: string;
  category: string;
  material: string;
  confidence: number;
  condition: string;
  components: string[];
  suggestedWeight: number;
  explanation: string;
  safetyTip: string;
  imageKey: string;
  lowConfidence?: boolean;
};

// ─── Vision Prompt ─────────────────────────────────────────────────────────────
// The prompt instructs the AI to classify based on what it SEES in the image.
// It does NOT reference the file name. This prevents the "always returns Charger" bug.

const VISION_PROMPT = `You are an expert AI vision classifier for Indian e-waste recycling, certified under CPCB/EPR norms and JNARDDC standards.

TASK: Look carefully at the actual physical object in the image. Identify it precisely.

Return ONLY a JSON object with these exact keys — no markdown, no extra text:

{
  "object": "The specific item name you can clearly see (e.g. Computer Mouse, USB Keyboard, Li-ion Battery Pack, Printed Circuit Board, LCD Monitor, Electric Motor, Mobile Phone Charger, Smartphone, Laptop, Copper Wire Bundle). Be specific and accurate.",
  "category": "Formal e-waste category. Choose ONE from: Computer Peripherals / Small IT Equipment | Cables & Wiring | Portable Batteries / Cells | Printed Circuit Boards (PCBs) | Screens & Monitors | Motors & Inductors | Chargers & Power Adapters | Mobile Devices | Large Household Appliances | Small Household Appliances | IT & Telecommunications Equipment | Consumer Electronics",
  "material": "Exactly ONE of: cables | batteries | pcb | panels | motors | plastics. Rules: plastics for IT peripherals/phones/chargers/keyboards/mice. cables for wire bundles. batteries for any battery type. pcb for circuit boards. panels for screens/displays. motors for motors/compressors.",
  "confidence": "Integer 50-99. Lower (50-65) if image is blurry, dark, or ambiguous. Higher (75-99) if the item is clearly visible.",
  "condition": "Exactly ONE of: Sorted | Mixed | Damaged",
  "components": ["Array of 2 to 5 specific physical materials or sub-components you can see"],
  "suggestedWeight": 0.12,
  "explanation": "One or two sentences: what you see and why it has recycling value. Max 250 chars.",
  "safetyTip": "Practical safety advice specific to this item. Max 150 chars."
}

CRITICAL:
- Base your answer on what you see in the image pixels, not any text.
- Computer mouse → object: Computer Mouse, category: Computer Peripherals, material: plastics.
- Mobile phone charger → object: Mobile Phone Charger, material: plastics.
- Battery pack → material: batteries.
- Copper wires → material: cables.
- Circuit board → material: pcb.
- LCD/LED screen → material: panels.
- Electric motor → material: motors.`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function json(data: unknown, status = 200): Response {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

function toBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64");
  }
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

function extractJson(raw: string): Record<string, unknown> {
  const stripped = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  const start = stripped.indexOf("{");
  const end = stripped.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("AI returned invalid JSON");
  return JSON.parse(stripped.slice(start, end + 1)) as Record<string, unknown>;
}

// ─── Route Handler ─────────────────────────────────────────────────────────────

export async function POST(request: Request): Promise<Response> {
  // 1. Parse form
  let form: FormData;
  try {
    form = await request.formData();
  } catch (err) {
    console.error("[/api/scan] Failed to parse form data:", err);
    return json({ error: "Invalid request format" }, 400);
  }

  // 2. Validate image
  const image = form.get("image");
  if (!(image instanceof File)) {
    return json({ error: "Please select a scrap photo to analyse" }, 400);
  }
  if (!image.type.startsWith("image/")) {
    console.warn("[/api/scan] Invalid file type:", image.type);
    return json({ error: "Only image files (JPG, PNG, WEBP) are supported" }, 400);
  }
  if (image.size > 10 * 1024 * 1024) {
    console.warn("[/api/scan] File too large:", image.size);
    return json({ error: "Image must be smaller than 10 MB" }, 400);
  }
  if (image.size < 100) {
    return json({ error: "The uploaded image appears to be empty or corrupted" }, 400);
  }

  // 3. Read bytes
  let bytes: Uint8Array;
  try {
    bytes = new Uint8Array(await image.arrayBuffer());
  } catch (err) {
    console.error("[/api/scan] Failed to read image bytes:", err);
    return json({ error: "Unable to read the uploaded image" }, 400);
  }

  // 4. Generate storage key
  const safeFileName = image.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const imageKey = `uploads/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${safeFileName}`;

  // 5. Check API key
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    console.error(
      "[/api/scan] GEMINI_API_KEY is not set. Add it to .env.local (local) or Vercel Environment Variables (production)."
    );
    return json(
      { error: "The AI scanner is not configured. Please contact the administrator.", retryable: false },
      503
    );
  }

  const model = getGeminiModel();
  console.log(`[/api/scan] Calling ${model} | size: ${bytes.length}b | type: ${image.type}`);

  // 6. Call Gemini Vision
  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const aiResponse = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: VISION_PROMPT },
              { inline_data: { mime_type: image.type, data: toBase64(bytes) } },
            ],
          },
        ],
        generationConfig: { temperature: 0.1, maxOutputTokens: 1024 },
      }),
    });

    if (!aiResponse.ok) {
      const errBody = await aiResponse.text().catch(() => "");
      console.error(`[/api/scan] Gemini HTTP ${aiResponse.status}:`, errBody.slice(0, 500));
      return json(
        { error: "Unable to analyse this image right now. Please try again.", retryable: true },
        500
      );
    }

    const payload = (await aiResponse.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
      error?: { message?: string };
    };

    if (payload.error) {
      console.error("[/api/scan] Gemini API error:", payload.error.message);
      return json(
        { error: "Unable to analyse this image right now. Please try again.", retryable: true },
        500
      );
    }

    const rawText = payload.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    if (!rawText) {
      console.error("[/api/scan] Gemini returned empty response");
      return json(
        { error: "The AI returned no result. Please try again with a clearer photo.", retryable: true },
        500
      );
    }

    // 7. Parse and validate AI response
    const parsed = extractJson(rawText);

    const object = String(parsed.object || "").trim();
    if (!object) {
      console.error("[/api/scan] AI did not identify an object. Raw:", rawText.slice(0, 200));
      return json(
        { error: "AI could not identify an object in this image. Please try a clearer photo.", retryable: true },
        422
      );
    }

    const category = String(parsed.category || "Small IT Equipment").trim();
    const rawMat = String(parsed.material ?? "").toLowerCase().trim();
    const material = normalizeMaterial(rawMat, object, category);
    const rawConf = Number(parsed.confidence);
    const confidence = Number.isFinite(rawConf) ? Math.max(50, Math.min(99, Math.round(rawConf))) : 60;
    const rawCond = String(parsed.condition ?? "");
    const condition = ["Sorted", "Mixed", "Damaged"].includes(rawCond) ? rawCond : "Sorted";
    const components = Array.isArray(parsed.components)
      ? parsed.components.map(String).slice(0, 5)
      : ["Electronic components", "Plastic housing"];
    const rawWeight = Number(parsed.suggestedWeight);
    const suggestedWeight = Number.isFinite(rawWeight) && rawWeight > 0 ? rawWeight : 0.3;
    const explanation = String(parsed.explanation || "E-waste item identified from image.").slice(0, 300);
    const safetyTip = String(
      parsed.safetyTip || "Handle with gloves. Do not burn or dismantle without safety equipment."
    ).slice(0, 200);

    const lowConfidence = confidence < 65;

    console.log(`[/api/scan] Result: "${object}" | ${category} | ${confidence}% | lowConf:${lowConfidence}`);

    return json({
      object,
      category,
      material,
      confidence,
      condition,
      components,
      suggestedWeight,
      explanation,
      safetyTip,
      imageKey,
      lowConfidence,
    });
  } catch (err) {
    console.error("[/api/scan] Unexpected error during AI scan:", err);
    return json(
      { error: "Unable to analyse this image right now. Please try again.", retryable: true },
      500
    );
  }
}

export async function GET(): Promise<Response> {
  return json({ status: "AI scanner ready", model: getGeminiModel() });
}

