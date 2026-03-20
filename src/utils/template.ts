export function migrationTemplate(name: string): string {
  return `import { Db } from "mongodb";

export async function up(db: Db): Promise<void> {
  // ${name}
}

export async function down(db: Db): Promise<void> {
  // revert ${name}
}
`;
}

export function seedTemplate(name: string): string {
  return `import { Db } from "mongodb";

export async function run(db: Db): Promise<void> {
  // ${name}
}
`;
}
