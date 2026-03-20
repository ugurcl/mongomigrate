import { Db } from "mongodb";

export interface MigrationConfig {
  uri: string;
  database: string;
  migrationsDir: string;
  seedsDir: string;
  migrationsCollection: string;
  lockCollection: string;
}

export interface MigrationFile {
  name: string;
  timestamp: string;
  filePath: string;
}

export interface MigrationRecord {
  name: string;
  appliedAt: Date;
}

export interface MigrationModule {
  up: (db: Db) => Promise<void>;
  down: (db: Db) => Promise<void>;
}

export interface LockDocument {
  _id: string;
  lockedAt: Date;
  expiresAt: Date;
}

export const DEFAULT_CONFIG: MigrationConfig = {
  uri: "mongodb://localhost:27017",
  database: "myapp",
  migrationsDir: "migrations",
  seedsDir: "seeds",
  migrationsCollection: "_migrations",
  lockCollection: "_migration_lock",
};
