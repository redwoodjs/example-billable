import { env } from "cloudflare:workers";
import { type Database, createDb } from "rwsdk/db";
import { type migrations } from "@/db/migrations";

export type AppDatabase = Database<typeof migrations>;
export type User = AppDatabase["User"];
export type Invoice = AppDatabase["Invoice"];
export type Credential = AppDatabase["Credential"];

export const db = createDb<AppDatabase>(
  env.APP_DURABLE_OBJECT,
  "app-database"
);

