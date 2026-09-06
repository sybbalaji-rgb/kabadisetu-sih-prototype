type ScanEnv = {
  BUCKET?: R2Bucket;
  GEMINI_API_KEY?: string;
  GEMINI_MODEL?: string;
};

async function bindings() {
  return (await import("cloudflare:workers")).env as unknown as ScanEnv;
}

const allowed = new Set(["cables", "batteries", "pcb", "panels", "motors", "plastics"]);

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

function base64(bytes: Uint8Array) {
  let binary = "";
  for (let start = 0; start < bytes.length; start += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(start, start + 0x8000));
  }
  return btoa(binary);
}

function extractJson(value: string) {
  const clean = value.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("The vision model returned an invalid result");
  return JSON.parse(clean.slice(start, end + 1)) as Record<string, unknown>;
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const image = form.get("image");
    if (!(image instanceof File)) return json({ error: "Choose a scrap photo" }, 400);
    if (!image.type.startsWith("image/")) return json({ error: "Only image files are supported" }, 400);
    if (image.size > 5 * 1024 * 1024) return json({ error: "Image must be smaller than 5 MB" }, 400);

    const runtime = await bindings();
    const bytes = new Uint8Array(await image.arrayBuffer());
    const imageKey = `uploads/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${image.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
    if (runtime.BUCKET) {
      await runtime.BUCKET.put(imageKey, bytes, { httpMetadata: { contentType: image.type } });
    }

    if (!runtime.GEMINI_API_KEY) {
      return json({
        error: "AI scanner is ready, but GEMINI_API_KEY has not been configured on the deployment.",
        imageKey,
      }, 503);
    }

    const model = runtime.GEMINI_MODEL || "gemini-2.5-flash";
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(runtime.GEMINI_API_KEY)}`;
    const prompt = `You classify Indian e-waste collection photos. Return JSON only with keys material, confidence, condition, explanation, safetyTip.
material must be exactly one of: cables, batteries, pcb, panels, motors, plastics.
confidence must be an integer from 0 to 100. condition must be exactly Sorted, Mixed, or Damaged.
If several materials appear, choose the dominant recoverable category and lower confidence. Do not estimate weight or price.`;
    const aiResponse = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: image.type, data: base64(bytes) } }] }], generationConfig: { responseMimeType: "application/json", temperature: 0.1 } }),
    });
    if (!aiResponse.ok) throw new Error(`Vision service failed (${aiResponse.status})`);
    const payload = await aiResponse.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    const parsed = extractJson(payload.candidates?.[0]?.content?.parts?.[0]?.text ?? "");
    const material = String(parsed.material ?? "").toLowerCase();
    if (!allowed.has(material)) throw new Error("The image could not be classified safely");
    return json({
      material,
      confidence: Math.max(0, Math.min(100, Math.round(Number(parsed.confidence) || 0))),
      condition: ["Sorted", "Mixed", "Damaged"].includes(String(parsed.condition)) ? parsed.condition : "Mixed",
      explanation: String(parsed.explanation ?? "Material category detected from the uploaded image").slice(0, 300),
      safetyTip: String(parsed.safetyTip ?? "Handle with gloves and do not burn or dismantle the material").slice(0, 300),
      imageKey,
    });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Image scan failed" }, 400);
  }
}

export async function GET(request: Request) {
  const runtime = await bindings();
  const key = new URL(request.url).searchParams.get("key") ?? "";
  if (!runtime.BUCKET || !key.startsWith("uploads/")) return new Response("Not found", { status: 404 });
  const object = await runtime.BUCKET.get(key);
  if (!object) return new Response("Not found", { status: 404 });
  return new Response(object.body, { headers: { "Content-Type": object.httpMetadata?.contentType || "application/octet-stream", "Cache-Control": "public, max-age=86400" } });
}
