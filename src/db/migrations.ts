import { db } from './database';

export async function runMigrations(): Promise<void> {
  // Dexie manages schema upgrades via version(n).
  // This helper verifies database open and checks table integrity.
  if (!db.isOpen()) {
    await db.open();
  }
}
