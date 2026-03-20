import { readdirSync } from "fs";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { loadConfig } from "../utils/config.js";
import { connect, disconnect } from "../core/connection.js";
import { log } from "../utils/logger.js";

interface SeedModule {
  run: (db: import("mongodb").Db) => Promise<void>;
}

export async function seed(): Promise<void> {
  const config = await loadConfig();
  const db = await connect(config);
  const seedsDir = resolve(process.cwd(), config.seedsDir);

  try {
    const files = readdirSync(seedsDir)
      .filter((f) => f.endsWith(".ts") || f.endsWith(".js"))
      .sort();

    if (files.length === 0) {
      log.info("No seed files found.");
      return;
    }

    for (const file of files) {
      const filePath = resolve(seedsDir, file);
      const url = pathToFileURL(filePath).href;
      const mod = (await import(url)) as SeedModule;
      const start = Date.now();
      await mod.run(db);
      const ms = Date.now() - start;
      log.success(`${file} ${`(${ms}ms)`}`);
    }

    log.success(`Executed ${files.length} seed${files.length > 1 ? "s" : ""}.`);
  } finally {
    await disconnect();
  }
}
