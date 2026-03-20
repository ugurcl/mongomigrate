import { existsSync } from "fs";
import { mkdir, writeFile } from "fs/promises";
import { resolve } from "path";
import { DEFAULT_CONFIG } from "../types/index.js";
import { getConfigPath } from "../utils/config.js";
import { log } from "../utils/logger.js";

export async function init(): Promise<void> {
  const configPath = getConfigPath();

  if (existsSync(configPath)) {
    log.warn("Config file already exists.");
    return;
  }

  const config = {
    uri: DEFAULT_CONFIG.uri,
    database: DEFAULT_CONFIG.database,
    migrationsDir: DEFAULT_CONFIG.migrationsDir,
    seedsDir: DEFAULT_CONFIG.seedsDir,
  };

  await writeFile(configPath, JSON.stringify(config, null, 2));
  log.success(`Created ${configPath}`);

  const migrationsDir = resolve(process.cwd(), DEFAULT_CONFIG.migrationsDir);
  const seedsDir = resolve(process.cwd(), DEFAULT_CONFIG.seedsDir);

  if (!existsSync(migrationsDir)) {
    await mkdir(migrationsDir, { recursive: true });
    log.success(`Created ${DEFAULT_CONFIG.migrationsDir}/`);
  }

  if (!existsSync(seedsDir)) {
    await mkdir(seedsDir, { recursive: true });
    log.success(`Created ${DEFAULT_CONFIG.seedsDir}/`);
  }

  log.info('Ready. Run "mongomigrate create <name>" to create a migration.');
}
