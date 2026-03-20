import { Command } from "commander";
import { init } from "./commands/init.js";
import { create } from "./commands/create.js";
import { up } from "./commands/up.js";
import { down } from "./commands/down.js";
import { status } from "./commands/status.js";
import { reset } from "./commands/reset.js";
import { seed } from "./commands/seed.js";
import { fresh } from "./commands/fresh.js";

const program = new Command();

program
  .name("mongomigrate")
  .description("MongoDB migration CLI tool")
  .version("1.0.0");

program
  .command("init")
  .description("Initialize migration config and directories")
  .action(init);

program
  .command("create <name>")
  .description("Create a new migration file")
  .action(create);

program
  .command("up")
  .description("Run all pending migrations")
  .option("-d, --dry-run", "Preview migrations without executing")
  .option("-t, --to <name>", "Run migrations up to a specific migration")
  .option("-v, --verbose", "Show detailed output")
  .option("--timeout <ms>", "Timeout per migration in milliseconds", parseInt)
  .action((opts) => up({ dryRun: opts.dryRun, to: opts.to, verbose: opts.verbose, timeout: opts.timeout }));

program
  .command("down")
  .description("Revert the last applied migration")
  .option("-d, --dry-run", "Preview revert without executing")
  .option("-v, --verbose", "Show detailed output")
  .option("--timeout <ms>", "Timeout per migration in milliseconds", parseInt)
  .action((opts) => down({ dryRun: opts.dryRun, verbose: opts.verbose, timeout: opts.timeout }));

program
  .command("status")
  .description("Show migration status")
  .action(status);

program
  .command("reset")
  .description("Revert all applied migrations")
  .option("-d, --dry-run", "Preview revert without executing")
  .option("-v, --verbose", "Show detailed output")
  .option("--timeout <ms>", "Timeout per migration in milliseconds", parseInt)
  .action((opts) => reset({ dryRun: opts.dryRun, verbose: opts.verbose, timeout: opts.timeout }));

program
  .command("fresh")
  .description("Reset and re-run all migrations from scratch")
  .option("-v, --verbose", "Show detailed output")
  .option("--timeout <ms>", "Timeout per migration in milliseconds", parseInt)
  .action((opts) => fresh({ verbose: opts.verbose, timeout: opts.timeout }));

program
  .command("seed")
  .description("Run seed files")
  .action(seed);

program.parse();
