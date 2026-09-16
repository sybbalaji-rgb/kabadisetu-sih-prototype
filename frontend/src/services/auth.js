import { apiCall } from "./api";

const STORAGE_KEY = "kabadisetu_session";

export function getStoredSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSession(session) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch (e) {
    console.error("Failed to save session to localStorage:", e);
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error("Failed to clear session:", e);
  }
}

export async function loginUser(role, contact, displayName, authorizationId, serviceArea) {
  const result = await apiCall("register", {
    role,
    contact,
    displayName: displayName || `${role.toUpperCase()} User`,
    authorizationId,
    serviceArea,
  });

  if (result.profile) {
    saveSession(result.profile);
    return result.profile;
  }
  throw new Error("Login failed");
}
