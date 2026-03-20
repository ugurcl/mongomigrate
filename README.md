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

### `mongomigrate down`

Reverts the last applied migration.

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
  "seedsDir": "seeds"
}
```

## Features

- Timestamped migration files with up/down support
- Distributed lock prevents concurrent migration runs
- Migration state tracked in MongoDB (`_migrations` collection)
- Seed system for test data
- Colored terminal output

## License

MIT
