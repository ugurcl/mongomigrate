import { readFile } from "fs/promises";
import { resolve } from "path";
import { DEFAULT_CONFIG, MigrationConfig } from "../types/index.js";

const CONFIG_FILE = "mongomigrate.json";

export async function loadConfig(): Promise<MigrationConfig> {
  const configPath = resolve(process.cwd(), CONFIG_FILE);

  try {
    const raw = await readFile(configPath, "utf-8");
    const userConfig = JSON.parse(raw);
    return { ...DEFAULT_CONFIG, ...userConfig };
  } catch {
    throw new Error(
      `Config file not found: ${CONFIG_FILE}\nRun "mongomigrate init" first.`
    );
  }
}

export function getConfigPath(): string {
  return resolve(process.cwd(), CONFIG_FILE);
}
