import chalk from "chalk";

let verboseEnabled = false;

export function setVerbose(enabled: boolean): void {
  verboseEnabled = enabled;
}

export const log = {
  info: (msg: string) => process.stdout.write(`${chalk.blue("ℹ")} ${msg}\n`),
  success: (msg: string) =>
    process.stdout.write(`${chalk.green("✓")} ${msg}\n`),
  error: (msg: string) => process.stdout.write(`${chalk.red("✗")} ${msg}\n`),
  warn: (msg: string) =>
    process.stdout.write(`${chalk.yellow("⚠")} ${msg}\n`),
  verbose: (msg: string) => {
    if (verboseEnabled) {
      process.stdout.write(`${chalk.gray("  →")} ${chalk.gray(msg)}\n`);
    }
  },
  migration: (direction: "up" | "down", name: string, ms: number) => {
    const arrow = direction === "up" ? chalk.green("↑") : chalk.red("↓");
    const time = chalk.gray(`(${ms}ms)`);
    process.stdout.write(`  ${arrow} ${name} ${time}\n`);
  },
  dryRun: (direction: "up" | "down", name: string) => {
    const arrow = direction === "up" ? chalk.cyan("↑") : chalk.cyan("↓");
    const tag = chalk.cyan("[dry-run]");
    process.stdout.write(`  ${arrow} ${name} ${tag}\n`);
  },
};
