import chalk from "chalk";

export const log = {
  info: (msg: string) => process.stdout.write(`${chalk.blue("ℹ")} ${msg}\n`),
  success: (msg: string) =>
    process.stdout.write(`${chalk.green("✓")} ${msg}\n`),
  error: (msg: string) => process.stdout.write(`${chalk.red("✗")} ${msg}\n`),
  warn: (msg: string) =>
    process.stdout.write(`${chalk.yellow("⚠")} ${msg}\n`),
  migration: (direction: "up" | "down", name: string, ms: number) => {
    const arrow = direction === "up" ? chalk.green("↑") : chalk.red("↓");
    const time = chalk.gray(`(${ms}ms)`);
    process.stdout.write(`  ${arrow} ${name} ${time}\n`);
  },
};
