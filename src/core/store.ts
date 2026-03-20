import { Db } from "mongodb";
import { MigrationRecord } from "../types/index.js";

export class MigrationStore {
  private collectionName: string;
  private db: Db;

  constructor(db: Db, collectionName: string) {
    this.db = db;
    this.collectionName = collectionName;
  }

  private get collection() {
    return this.db.collection<MigrationRecord>(this.collectionName);
  }

  async getApplied(): Promise<MigrationRecord[]> {
    return this.collection.find().sort({ appliedAt: 1 }).toArray();
  }

  async isApplied(name: string): Promise<boolean> {
    const record = await this.collection.findOne({ name });
    return record !== null;
  }

  async add(name: string): Promise<void> {
    await this.collection.insertOne({
      name,
      appliedAt: new Date(),
    });
  }

  async remove(name: string): Promise<void> {
    await this.collection.deleteOne({ name });
  }

  async clear(): Promise<void> {
    await this.collection.deleteMany({});
  }

  async getLastApplied(): Promise<MigrationRecord | null> {
    const records = await this.collection
      .find()
      .sort({ appliedAt: -1 })
      .limit(1)
      .toArray();
    return records[0] || null;
  }
}
