import { Db, MongoClient } from "mongodb";
import { MigrationConfig } from "../types/index.js";

let client: MongoClient | null = null;

export async function connect(config: MigrationConfig): Promise<Db> {
  client = new MongoClient(config.uri);
  await client.connect();
  return client.db(config.database);
}

export async function disconnect(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
  }
}
