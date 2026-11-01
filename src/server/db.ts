import { env } from "@/server/env";
import { migrate } from "@/server/schema";
import type { Sql } from "@/server/sql";

let sqliteDb: Sql | null = null;

function bindable(params: readonly unknown[] | undefined): unknown[] {
  return (params ?? []).map((value) => (value === undefined ? null : value));
}

async function openSqlite(): Promise<Sql> {
  const { DatabaseSync } = await import("node:sqlite");
  const fs = (await import("node:fs")) as {
    mkdirSync(path: string, options: { recursive: boolean }): void;
  };
  const path = (await import("node:path")) as {
    resolve(...parts: string[]): string;
    dirname(path: string): string;
  };
  const cwd = (globalThis as { process?: { cwd?: () => string } }).process?.cwd?.() ?? ".";
  const configured = await env("PORTAL_DB_PATH");
  const file = path.resolve(cwd, configured ?? ".data/portal.sqlite");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const database = new DatabaseSync(file);
  database.exec("PRAGMA journal_mode = WAL");
  database.exec("PRAGMA foreign_keys = ON");
  return {
    async exec(sql) {
      database.exec(sql);
    },
    async get(sql, params) {
      return database.prepare(sql).get(...bindable(params)) ?? undefined;
    },
    async all(sql, params) {
      return database.prepare(sql).all(...bindable(params));
    },
    async run(sql, params) {
      const info = database.prepare(sql).run(...bindable(params));
      return { changes: Number(info.changes) };
    },
  };
}

/** Archivo SQLite local. El alojamiento se decidirá al publicar la web. */
export async function getDb(): Promise<Sql> {
  if (!sqliteDb) {
    const db = await openSqlite();
    await migrate(db);
    sqliteDb = db;
  }
  return sqliteDb;
}
