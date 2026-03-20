import { loadConfig } from "../utils/config.js";
import { connect, disconnect } from "../core/connection.js";
import { MigrationStore } from "../core/store.js";
import { MigrationLock } from "../core/lock.js";
import { getMigrationFiles, runMigration } from "../core/runner.js";
import { log } from "../utils/logger.js";

export async function up(): Promise<void> {
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
    const files = getMigrationFiles(config.migrationsDir);
    let applied = 0;

    for (const file of files) {
      const alreadyApplied = await store.isApplied(file.name);
      if (alreadyApplied) continue;

      const ms = await runMigration(db, file.filePath, "up");
      await store.add(file.name);
      log.migration("up", file.name, ms);
      applied++;
    }

    if (applied === 0) {
      log.info("All migrations are up to date.");
    } else {
      log.success(`Applied ${applied} migration${applied > 1 ? "s" : ""}.`);
    }
  } finally {
    await lock.release();
    await disconnect();
  }
}
