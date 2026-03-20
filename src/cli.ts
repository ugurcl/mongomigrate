import { Command } from "commander";
import { init } from "./commands/init.js";
import { create } from "./commands/create.js";
import { up } from "./commands/up.js";
import { down } from "./commands/down.js";
import { status } from "./commands/status.js";
import { reset } from "./commands/reset.js";
import { seed } from "./commands/seed.js";

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
  .action(up);

program
  .command("down")
  .description("Revert the last applied migration")
  .action(down);

program
  .command("status")
  .description("Show migration status")
  .action(status);

program
  .command("reset")
  .description("Revert all applied migrations")
  .action(reset);

program
  .command("seed")
  .description("Run seed files")
  .action(seed);

program.parse();
