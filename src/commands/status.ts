import chalk from "chalk";
import { loadConfig } from "../utils/config.js";
import { connect, disconnect } from "../core/connection.js";
import { MigrationStore } from "../core/store.js";
import { getMigrationFiles } from "../core/runner.js";

export async function status(): Promise<void> {
  const config = await loadConfig();
  const db = await connect(config);
  const store = new MigrationStore(db, config.migrationsCollection);

  try {
    const files = getMigrationFiles(config.migrationsDir);
    const applied = await store.getApplied();
    const appliedNames = new Set(applied.map((r) => r.name));

    if (files.length === 0) {
      process.stdout.write("No migration files found.\n");
      return;
    }

    const header = `${"Status".padEnd(12)}| ${"Migration".padEnd(50)}| Applied At`;
    const separator = "-".repeat(header.length);

    process.stdout.write(`\n${header}\n${separator}\n`);

    for (const file of files) {
      const isApplied = appliedNames.has(file.name);
      const record = applied.find((r) => r.name === file.name);

      const statusText = isApplied
        ? chalk.green("✓ applied".padEnd(12))
        : chalk.yellow("✗ pending".padEnd(12));

      const appliedAt = record
        ? chalk.gray(record.appliedAt.toISOString())
        : chalk.gray("-");

      process.stdout.write(`${statusText}| ${file.name.padEnd(50)}| ${appliedAt}\n`);
    }

    process.stdout.write("\n");
  } finally {
    await disconnect();
  }
}
