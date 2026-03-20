import { loadConfig } from "../utils/config.js";
import { connect, disconnect } from "../core/connection.js";
import { MigrationStore } from "../core/store.js";
import { MigrationLock } from "../core/lock.js";
import { getMigrationFiles, runMigration } from "../core/runner.js";
import { log, setVerbose } from "../utils/logger.js";
import { CommandOptions } from "../types/index.js";

export async function reset(options: CommandOptions = {}): Promise<void> {
  if (options.verbose) setVerbose(true);

  const config = await loadConfig();
  const timeout = options.timeout ?? config.timeout;

  log.verbose(`Connecting to ${config.uri}/${config.database}`);
  const db = await connect(config);
  const store = new MigrationStore(db, config.migrationsCollection);
  const lock = new MigrationLock(db, config.lockCollection);

  if (!options.dryRun) {
    const acquired = await lock.acquire();
    if (!acquired) {
      log.error("Another migration is in progress. Try again later.");
      await disconnect();
      process.exit(1);
    }
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

      if (options.dryRun) {
        log.dryRun("down", file.name);
        reverted++;
        continue;
      }

      const ms = await runMigration(db, file.filePath, "down", timeout);
      await store.remove(record.name);
      log.migration("down", file.name, ms);
      reverted++;
    }

    if (options.dryRun) {
      log.info(`${reverted} migration${reverted > 1 ? "s" : ""} would be reverted.`);
    } else {
      log.success(`Reverted ${reverted} migration${reverted > 1 ? "s" : ""}.`);
    }
  } finally {
    if (!options.dryRun) await lock.release();
    await disconnect();
  }
}
