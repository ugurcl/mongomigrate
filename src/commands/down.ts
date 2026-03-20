import { loadConfig } from "../utils/config.js";
import { connect, disconnect } from "../core/connection.js";
import { MigrationStore } from "../core/store.js";
import { MigrationLock } from "../core/lock.js";
import { getMigrationFiles, runMigration } from "../core/runner.js";
import { log } from "../utils/logger.js";

export async function down(): Promise<void> {
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
    const last = await store.getLastApplied();
    if (!last) {
      log.info("No migrations to revert.");
      return;
    }

    const files = getMigrationFiles(config.migrationsDir);
    const file = files.find((f) => f.name === last.name);

    if (!file) {
      log.error(`Migration file not found: ${last.name}`);
      process.exit(1);
    }

    const ms = await runMigration(db, file.filePath, "down");
    await store.remove(file.name);
    log.migration("down", file.name, ms);
    log.success("Reverted 1 migration.");
  } finally {
    await lock.release();
    await disconnect();
  }
}
