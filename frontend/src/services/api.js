export async function apiCall(action, payload = {}) {
  const response = await fetch("/api/platform", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...payload }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}

export async function fetchPlatformData(profileId) {
  const url = profileId ? `/api/platform?profileId=${encodeURIComponent(profileId)}` : "/api/platform";
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to load platform data");
  }
  return data;
}

export async function scanScrapImage(file) {
  const form = new FormData();
  form.append("image", file);

  const response = await fetch("/api/scan", {
    method: "POST",
    body: form,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Image scan failed");
  }
  return data;
}
