# mongomigrate

MongoDB migration CLI tool. Manage database schema changes with versioned migration files.

## Install

```bash
npm install -g mongomigrate
```

## Quick Start

```bash
mongomigrate init
mongomigrate create add-users-index
mongomigrate up
```

## Commands

### `mongomigrate init`

Creates `mongomigrate.json` config file and `migrations/` + `seeds/` directories.

### `mongomigrate create <name>`

Creates a new timestamped migration file:

```
migrations/20260320_143022_add-users-index.ts
```

```ts
import { Db } from "mongodb";

export async function up(db: Db): Promise<void> {
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
}

export async function down(db: Db): Promise<void> {
  await db.collection("users").dropIndex("email_1");
}
```

### `mongomigrate up`

Runs all pending migrations in order.

```
  ↑ 20260320_143022_add-users-index (45ms)
✓ Applied 1 migration.
```

**Flags:**

| Flag | Description |
|------|-------------|
| `-d, --dry-run` | Preview migrations without executing |
| `-t, --to <name>` | Run migrations up to a specific migration |
| `-v, --verbose` | Show detailed output |
| `--timeout <ms>` | Timeout per migration in milliseconds |

```bash
mongomigrate up --dry-run
mongomigrate up --to add-users-index
mongomigrate up --verbose --timeout 30000
```

### `mongomigrate down`

Reverts the last applied migration.

**Flags:** `--dry-run`, `--verbose`, `--timeout <ms>`

### `mongomigrate status`

Shows which migrations are applied and which are pending.

```
Status      | Migration                                         | Applied At
-------------------------------------------------------------------------
✓ applied   | 20260320_140000_create-users-collection            | 2026-03-20T14:00:30Z
✓ applied   | 20260320_141500_add-email-field                    | 2026-03-20T14:15:45Z
✗ pending   | 20260320_143022_add-users-index                    | -
```

### `mongomigrate reset`

Reverts all applied migrations in reverse order.

**Flags:** `--dry-run`, `--verbose`, `--timeout <ms>`

### `mongomigrate fresh`

Resets all migrations and re-runs them from scratch. Equivalent to `reset` + `up`.

**Flags:** `--verbose`, `--timeout <ms>`

### `mongomigrate seed`

Runs all files in the `seeds/` directory.

```ts
import { Db } from "mongodb";

export async function run(db: Db): Promise<void> {
  await db.collection("users").insertMany([
    { name: "Alice", email: "alice@example.com" },
    { name: "Bob", email: "bob@example.com" },
  ]);
}
```

## Config

`mongomigrate.json`:

```json
{
  "uri": "mongodb://localhost:27017",
  "database": "myapp",
  "migrationsDir": "migrations",
  "seedsDir": "seeds",
  "timeout": 0
}
```

### Environment Variables

Config values can be overridden with environment variables:

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB connection URI |
| `MONGO_DATABASE` | Database name |

You can also use `${VAR}` syntax in the config file:

```json
{
  "uri": "${MONGO_URI}",
  "database": "${MONGO_DATABASE}"
}
```

## Features

- Timestamped migration files with up/down support
- Distributed lock prevents concurrent migration runs
- Migration state tracked in MongoDB (`_migrations` collection)
- Dry-run mode to preview changes before applying
- Run migrations up to a specific target (`--to`)
- Per-migration execution timeout
- Verbose mode for debugging
- Fresh command for full reset and re-apply
- Migration file validation (checks for up/down exports)
- Environment variable support
- Seed system for test data
- Colored terminal output

## Programmatic Usage

```ts
import { up, down, status, MigrationStore } from "mongomigrate";

await up({ dryRun: true, verbose: true });
await down({ timeout: 30000 });
```

## License

MIT
