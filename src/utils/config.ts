import { readFile } from "fs/promises";
import { resolve } from "path";
import { DEFAULT_CONFIG, MigrationConfig } from "../types/index.js";

const CONFIG_FILE = "mongomigrate.json";

function resolveEnvVars(value: string): string {
  return value.replace(/\$\{(\w+)\}/g, (_, key) => process.env[key] || "");
}

export async function loadConfig(): Promise<MigrationConfig> {
  const configPath = resolve(process.cwd(), CONFIG_FILE);

  try {
    const raw = await readFile(configPath, "utf-8");
    const userConfig = JSON.parse(raw);
    const merged = { ...DEFAULT_CONFIG, ...userConfig };

    if (process.env.MONGO_URI) {
      merged.uri = process.env.MONGO_URI;
    }
    if (process.env.MONGO_DATABASE) {
      merged.database = process.env.MONGO_DATABASE;
    }

    merged.uri = resolveEnvVars(merged.uri);
    merged.database = resolveEnvVars(merged.database);

    return merged;
  } catch {
    throw new Error(
      `Config file not found: ${CONFIG_FILE}\nRun "mongomigrate init" first.`
    );
  }
}

export function getConfigPath(): string {
  return resolve(process.cwd(), CONFIG_FILE);
}
