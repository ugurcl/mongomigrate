import { loadConfig } from "../utils/config.js";
import { connect, disconnect } from "../core/connection.js";
import { MigrationStore } from "../core/store.js";
import { MigrationLock } from "../core/lock.js";
import { getMigrationFiles, runMigration } from "../core/runner.js";
import { log, setVerbose } from "../utils/logger.js";
import { CommandOptions } from "../types/index.js";

export async function fresh(options: CommandOptions = {}): Promise<void> {
  if (options.verbose) setVerbose(true);

  const config = await loadConfig();
  const timeout = options.timeout ?? config.timeout;

  log.verbose(`Connecting to ${config.uri}/${config.database}`);
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
    const files = getMigrationFiles(config.migrationsDir);

    if (applied.length > 0) {
      const reversed = [...applied].reverse();

      for (const record of reversed) {
        const file = files.find((f) => f.name === record.name);
        if (!file) continue;

        const ms = await runMigration(db, file.filePath, "down", timeout);
        await store.remove(record.name);
        log.migration("down", file.name, ms);
      }

      log.success(`Reverted ${applied.length} migration${applied.length > 1 ? "s" : ""}.`);
    }

    let applied2 = 0;

    for (const file of files) {
      const ms = await runMigration(db, file.filePath, "up", timeout);
      await store.add(file.name);
      log.migration("up", file.name, ms);
      applied2++;
    }

    if (applied2 === 0) {
      log.info("No migration files found.");
    } else {
      log.success(`Applied ${applied2} migration${applied2 > 1 ? "s" : ""} from scratch.`);
    }
  } finally {
    await lock.release();
    await disconnect();
  }
}
