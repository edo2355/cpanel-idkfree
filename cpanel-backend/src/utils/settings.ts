import { db } from '../db.js';

export async function getSetting(key: string, fallback: string): Promise<string> {
  try {
    const res = await db.execute({ sql: 'SELECT value FROM app_settings WHERE key = ?', args: [key] });
    if (res.rows.length > 0 && res.rows[0].value) {
      return res.rows[0].value as string;
    }
  } catch (e) {
    console.warn(`⚠️ No se pudo leer ${key} de la DB.`);
  }
  return fallback;
}
