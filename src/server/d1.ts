type D1Prepared = {
  bind(...values: unknown[]): D1Prepared;
  first<T = unknown>(): Promise<T | null>;
  all<T = unknown>(): Promise<{ results?: T[] }>;
  run(): Promise<{ meta?: { changes?: number } }>;
};

export type D1Database = {
  prepare(sql: string): D1Prepared;
  exec(sql: string): Promise<unknown>;
};

type WorkerEnv = { DB?: D1Database };

/** D1 binding exposed by the Cloudflare worker. Absent when Vite runs on Node. */
export function getD1(): D1Database | null {
  const bag = (globalThis as { __env__?: WorkerEnv }).__env__;
  const database = bag?.DB;
  if (database && typeof database.prepare === "function") return database;
  return null;
}
