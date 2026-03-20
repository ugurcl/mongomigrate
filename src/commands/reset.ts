import { loadConfig } from "../utils/config.js";
import { connect, disconnect } from "../core/connection.js";
import { MigrationStore } from "../core/store.js";
import { MigrationLock } from "../core/lock.js";
import { getMigrationFiles, runMigration } from "../core/runner.js";
import { log } from "../utils/logger.js";

export async function reset(): Promise<void> {
  const config = await loadConfig();
  const db = await connect(config);
  const store = new MigrationStore(db, config.migrationsCollection);
  const lock = new MigrationLock(db, config.lockCollection);

  const acquired = await lock.acquire();
  if (!acquired) {
    log.error("Another migration is in progress. Try again later.");
    await disconnect();
    process.exit(1);
  }

  try {
    const applied = await store.getApplied();

    if (applied.length === 0) {
      log.info("No migrations to reset.");
      return;
    }

    const files = getMigrationFiles(config.migrationsDir);
    const reversed = [...applied].reverse();
    let reverted = 0;

    for (const record of reversed) {
      const file = files.find((f) => f.name === record.name);

      if (!file) {
        log.warn(`Migration file not found: ${record.name}, skipping.`);
        continue;
      }

      const ms = await runMigration(db, file.filePath, "down");
      await store.remove(record.name);
      log.migration("down", file.name, ms);
      reverted++;
    }

    log.success(`Reverted ${reverted} migration${reverted > 1 ? "s" : ""}.`);
  } finally {
    await lock.release();
    await disconnect();
  }
}
