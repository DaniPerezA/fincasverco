import { getD1, type D1Database } from "@/server/d1";
import { env } from "@/server/env";
import { migrate } from "@/server/schema";
import type { Sql } from "@/server/sql";

let sqliteDb: Sql | null = null;
let migratedD1 = false;

function bindable(params: readonly unknown[] | undefined): unknown[] {
  return (params ?? []).map((value) => (value === undefined ? null : value));
}

function wrapD1(d1: D1Database): Sql {
  return {
    async exec(sql) {
      await d1.exec(sql);
    },
    async get(sql, params) {
      const row = await d1
        .prepare(sql)
        .bind(...bindable(params))
        .first();
      return row ?? undefined;
    },
    async all(sql, params) {
      const result = await d1
        .prepare(sql)
        .bind(...bindable(params))
        .all();
      return result.results ?? [];
    },
    async run(sql, params) {
      const result = await d1
        .prepare(sql)
        .bind(...bindable(params))
        .run();
      return { changes: result.meta?.changes ?? 0 };
    },
  };
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

/**
 * Cloudflare D1 in production (binding `DB`) and a local SQLite file in `vite dev`.
 * Both speak the same SQL, so the portal does not depend on a separate database server.
 */
export async function getDb(): Promise<Sql> {
  const d1 = getD1();
  if (d1) {
    const db = wrapD1(d1);
    if (!migratedD1) {
      await migrate(db);
      migratedD1 = true;
    }
    return db;
  }
  if (!sqliteDb) {
    const db = await openSqlite();
    await migrate(db);
    sqliteDb = db;
  }
  return sqliteDb;
}
