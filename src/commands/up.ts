import { loadConfig } from "../utils/config.js";
import { connect, disconnect } from "../core/connection.js";
import { MigrationStore } from "../core/store.js";
import { MigrationLock } from "../core/lock.js";
import { getMigrationFiles, runMigration } from "../core/runner.js";
import { log, setVerbose } from "../utils/logger.js";
import { CommandOptions } from "../types/index.js";

export async function up(options: CommandOptions = {}): Promise<void> {
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
    let files = getMigrationFiles(config.migrationsDir);
    log.verbose(`Found ${files.length} migration file(s).`);

    if (options.to) {
      const targetIndex = files.findIndex((f) => f.name.includes(options.to!));
      if (targetIndex === -1) {
        log.error(`Migration not found: ${options.to}`);
        process.exit(1);
      }
      files = files.slice(0, targetIndex + 1);
      log.verbose(`Running up to: ${files[files.length - 1].name}`);
    }

    let applied = 0;

    for (const file of files) {
      const alreadyApplied = await store.isApplied(file.name);
      if (alreadyApplied) {
        log.verbose(`Skipping (already applied): ${file.name}`);
        continue;
      }

      if (options.dryRun) {
        log.dryRun("up", file.name);
        applied++;
        continue;
      }

      const ms = await runMigration(db, file.filePath, "up", timeout);
      await store.add(file.name);
      log.migration("up", file.name, ms);
      applied++;
    }

    if (applied === 0) {
      log.info("All migrations are up to date.");
    } else if (options.dryRun) {
      log.info(`${applied} migration${applied > 1 ? "s" : ""} would be applied.`);
    } else {
      log.success(`Applied ${applied} migration${applied > 1 ? "s" : ""}.`);
    }
  } finally {
    if (!options.dryRun) await lock.release();
    await disconnect();
  }
}
