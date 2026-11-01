export type Sql = {
  exec(sql: string): Promise<void>;
  get(sql: string, params?: readonly unknown[]): Promise<unknown>;
  all(sql: string, params?: readonly unknown[]): Promise<unknown[]>;
  run(sql: string, params?: readonly unknown[]): Promise<{ changes: number }>;
};

export function isRow(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function rowString(row: Record<string, unknown>, key: string): string {
  const value = row[key];
  if (typeof value !== "string") throw new Error(`Columna ${key} inesperada`);
  return value;
}

export function rowStringOrNull(row: Record<string, unknown>, key: string): string | null {
  const value = row[key];
  if (value == null) return null;
  if (typeof value !== "string") throw new Error(`Columna ${key} inesperada`);
  return value;
}

export function rowNumber(row: Record<string, unknown>, key: string): number {
  const value = row[key];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "bigint") return Number(value);
  throw new Error(`Columna ${key} inesperada`);
}
