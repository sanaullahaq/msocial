import { writeAsStringAsync, readAsStringAsync, getInfoAsync, documentDirectory, cacheDirectory } from "expo-file-system/legacy";

const BASE_DIR = documentDirectory || cacheDirectory || "";
const SETTINGS_FILE = BASE_DIR + "settings.json";
const LOG_FILE = BASE_DIR + "logs.json";
const USER_FILE = BASE_DIR + "user.txt";
const SUBS_FILE = BASE_DIR + "subs.txt";

export type StoredUser = {
  name: string;
  email: string;
  passwordBinary: string;
};

/**
 * Convert a password string to a simple binary representation.
 * Each character → charCode → 8-bit binary, joined with spaces.
 */
export function passwordToBinary(password: string): string {
  return password
    .split("")
    .map((ch) => ch.charCodeAt(0).toString(2).padStart(8, "0"))
    .join(" ");
}

/**
 * Save user credentials to user.txt
 */
export async function saveUser(user: StoredUser): Promise<void> {
  const serialized = JSON.stringify(user);
  await writeAsStringAsync(USER_FILE, serialized);
}

/**
 * Load user credentials from user.txt
 * Returns null if file doesn't exist or is invalid.
 */
export async function loadUser(): Promise<StoredUser | null> {
  try {
    const info = await getInfoAsync(USER_FILE);
    if (!info.exists) return null;

    const content = await readAsStringAsync(USER_FILE);
    const parsed = JSON.parse(content);
    if (!parsed || !parsed.email || !parsed.passwordBinary) return null;

    return parsed as StoredUser;
  } catch {
    return null;
  }
}

/**
 * Save subscription key to subs.txt
 */
export async function saveSubscriptionKey(key: string): Promise<void> {
  const serialized = JSON.stringify({ subscriptionKey: key });
  await writeAsStringAsync(SUBS_FILE, serialized);
}

/**
 * Load subscription key from subs.txt
 */
export async function loadSubscriptionKey(): Promise<string | null> {
  try {
    const info = await getInfoAsync(SUBS_FILE);
    if (!info.exists) return null;

    const content = await readAsStringAsync(SUBS_FILE);
    const parsed = JSON.parse(content);
    return parsed?.subscriptionKey ?? null;
  } catch {
    return null;
  }
}

// import { loadUser, saveUser, StoredUser, saveSubscriptionKey, loadSubscriptionKey } from "./utils";
// adjust imports to match your actual file

export async function updateUser(partial: Partial<StoredUser>): Promise<StoredUser | null> {
  const current = await loadUser();
  if (!current) return null;
  const updated: StoredUser = { ...current, ...partial };
  await saveUser(updated);
  return updated;
}

export async function validateSubsKey(): Promise<boolean> {
  try {
    const info = await getInfoAsync(SETTINGS_FILE);
    if (!info.exists) return false;

    const content = await readAsStringAsync(SETTINGS_FILE);
    const settings = JSON.parse(content);
    const subsKey = settings.subscriptionKey;
    if (!subsKey || typeof subsKey !== "string") return false;

    const response = await fetch(`https://accuvat.io/validate?subscriptionKey=${encodeURIComponent(subsKey)}`);
    const result = await response.json();
    return result === true || result.valid === true;
  } catch (e) {
    console.log("Subscription Key validation error:", e);
    return false;
  }
}