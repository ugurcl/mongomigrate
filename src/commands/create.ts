import { writeFile } from "fs/promises";
import { resolve } from "path";
import { loadConfig } from "../utils/config.js";
import { log } from "../utils/logger.js";
import { migrationTemplate } from "../utils/template.js";

function generateTimestamp(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const h = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");
  return `${y}${m}${d}_${h}${min}${s}`;
}

export async function create(name: string): Promise<void> {
  const config = await loadConfig();
  const timestamp = generateTimestamp();
  const fileName = `${timestamp}_${name}.ts`;
  const filePath = resolve(process.cwd(), config.migrationsDir, fileName);

  await writeFile(filePath, migrationTemplate(name));
  log.success(`Created ${config.migrationsDir}/${fileName}`);
}
