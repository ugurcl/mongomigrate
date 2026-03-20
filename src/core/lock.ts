import { Db } from "mongodb";
import { LockDocument } from "../types/index.js";

const LOCK_ID = "migration_lock";
const LOCK_TTL_MS = 5 * 60 * 1000;

export class MigrationLock {
  private collectionName: string;
  private db: Db;

  constructor(db: Db, collectionName: string) {
    this.db = db;
    this.collectionName = collectionName;
  }

  private get collection() {
    return this.db.collection<LockDocument>(this.collectionName);
  }

  async acquire(): Promise<boolean> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + LOCK_TTL_MS);

    await this.collection.deleteMany({
      expiresAt: { $lt: now },
    });

    try {
      await this.collection.insertOne({
        _id: LOCK_ID,
        lockedAt: now,
        expiresAt,
      });
      return true;
    } catch (err: any) {
      if (err.code === 11000) {
        return false;
      }
      throw err;
    }
  }

  async release(): Promise<void> {
    await this.collection.deleteOne({ _id: LOCK_ID });
  }
}
