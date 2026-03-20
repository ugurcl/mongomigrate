import { readdirSync } from "fs";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { Db } from "mongodb";
import { MigrationFile, MigrationModule } from "../types/index.js";

export function getMigrationFiles(migrationsDir: string): MigrationFile[] {
  const dir = resolve(process.cwd(), migrationsDir);

  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".ts") || f.endsWith(".js"))
    .sort();

  return files.map((f) => {
    const parts = f.replace(/\.(ts|js)$/, "").split("_");
    const timestamp = parts.slice(0, 2).join("_");
    const name = f.replace(/\.(ts|js)$/, "");

    return {
      name,
      timestamp,
      filePath: resolve(dir, f),
    };
  });
}

export async function loadMigration(
  filePath: string
): Promise<MigrationModule> {
  const url = pathToFileURL(filePath).href;
  const mod = await import(url);
  return mod as MigrationModule;
}

export function validateMigration(mod: MigrationModule, name: string): void {
  if (typeof mod.up !== "function") {
    throw new Error(`Migration "${name}" is missing "up" export.`);
  }
  if (typeof mod.down !== "function") {
    throw new Error(`Migration "${name}" is missing "down" export.`);
  }
}

export async function runMigration(
  db: Db,
  filePath: string,
  direction: "up" | "down",
  timeout?: number
): Promise<number> {
  const mod = await loadMigration(filePath);
  const name = filePath.split(/[\\/]/).pop() || filePath;
  validateMigration(mod, name);

  const start = Date.now();

  if (timeout && timeout > 0) {
    const result = mod[direction](db);
    const timer = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Migration "${name}" timed out after ${timeout}ms.`)), timeout)
    );
    await Promise.race([result, timer]);
  } else {
    await mod[direction](db);
  }

  return Date.now() - start;
}
