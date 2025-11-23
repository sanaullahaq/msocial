import { writeAsStringAsync, readAsStringAsync, getInfoAsync, documentDirectory, cacheDirectory } from "expo-file-system/legacy";

const SETTINGS_FILE = (documentDirectory || cacheDirectory) + "settings.json";
const LOG_FILE = (documentDirectory || cacheDirectory) + "logs.json";


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

// export async function appendLog(entry: { pageId: any; success: boolean; response: any; caption: string; imageName: string; }) {
//   let logs = [];
//   try {
//       const info = await getInfoAsync(LOG_FILE);
//       if (info.exists) {
//       const logText = await readAsStringAsync(LOG_FILE);
//       logs = JSON.parse(logText);
//       }
//   } catch {}

//   logs.push({ ...entry, timestamp: new Date().toLocaleString() });
//   await writeAsStringAsync(LOG_FILE, JSON.stringify(logs));
// }