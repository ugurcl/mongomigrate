import { loadConfig } from "../utils/config.js";
import { connect, disconnect } from "../core/connection.js";
import { MigrationStore } from "../core/store.js";
import { MigrationLock } from "../core/lock.js";
import { getMigrationFiles, runMigration } from "../core/runner.js";
import { log, setVerbose } from "../utils/logger.js";
import { CommandOptions } from "../types/index.js";

export async function down(options: CommandOptions = {}): Promise<void> {
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

    if (options.dryRun) {
      log.dryRun("down", file.name);
      log.info("1 migration would be reverted.");
      return;
    }

    const ms = await runMigration(db, file.filePath, "down", timeout);
    await store.remove(file.name);
    log.migration("down", file.name, ms);
    log.success("Reverted 1 migration.");
  } finally {
    if (!options.dryRun) await lock.release();
    await disconnect();
  }
}
