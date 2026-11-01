import { hashPassword } from "@/server/crypto";
import { env } from "@/server/env";
import { normalizeEmail } from "@/lib/portal/identity";
import { passwordError } from "@/lib/portal/password";
import { isRow, rowNumber, type Sql } from "@/server/sql";

const MIGRATIONS: { id: string; statements: string[] }[] = [
  {
    id: "0001_portal",
    statements: [
      `CREATE TABLE IF NOT EXISTS communities (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS admins (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        full_name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        failed_attempts INTEGER NOT NULL DEFAULT 0,
        locked_until TEXT,
        created_at TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS owners (
        id TEXT PRIMARY KEY,
        nif TEXT NOT NULL UNIQUE,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL,
        validated_at TEXT,
        validated_by TEXT,
        password_hash TEXT,
        activated_at TEXT,
        failed_attempts INTEGER NOT NULL DEFAULT 0,
        locked_until TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS owner_units (
        id TEXT PRIMARY KEY,
        owner_id TEXT NOT NULL,
        community_id TEXT NOT NULL,
        unit_type TEXT NOT NULL,
        unit_label TEXT NOT NULL,
        created_at TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        token_hash TEXT NOT NULL UNIQUE,
        subject_type TEXT NOT NULL,
        subject_id TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS email_tokens (
        id TEXT PRIMARY KEY,
        owner_id TEXT NOT NULL,
        purpose TEXT NOT NULL,
        token_hash TEXT NOT NULL UNIQUE,
        expires_at TEXT NOT NULL,
        used_at TEXT,
        created_at TEXT NOT NULL
      )`,
      `CREATE INDEX IF NOT EXISTS idx_owner_units_owner ON owner_units (owner_id)`,
      `CREATE INDEX IF NOT EXISTS idx_sessions_subject ON sessions (subject_type, subject_id)`,
      `CREATE INDEX IF NOT EXISTS idx_email_tokens_owner ON email_tokens (owner_id, purpose)`,
    ],
  },
];

let warnedMissingAdmin = false;

async function seedAdmin(db: Sql): Promise<void> {
  const count = await db.get("SELECT COUNT(*) AS n FROM admins");
  if (!isRow(count) || rowNumber(count, "n") > 0) return;

  const email = await env("PORTAL_ADMIN_EMAIL");
  const password = await env("PORTAL_ADMIN_PASSWORD");
  const fullName = (await env("PORTAL_ADMIN_NAME")) ?? "Administración";
  if (!email || !password) {
    if (!warnedMissingAdmin) {
      warnedMissingAdmin = true;
      console.info(
        "[portal] No hay administrador. Defina PORTAL_ADMIN_EMAIL y PORTAL_ADMIN_PASSWORD.",
      );
    }
    return;
  }
  const policy = passwordError(password);
  if (policy) {
    console.error(`[portal] PORTAL_ADMIN_PASSWORD no cumple la política: ${policy}`);
    return;
  }
  const passwordHash = await hashPassword(password);
  try {
    await db.run(
      `INSERT INTO admins (id, email, full_name, password_hash, failed_attempts, locked_until, created_at)
       SELECT ?, ?, ?, ?, 0, NULL, ?
       WHERE NOT EXISTS (SELECT 1 FROM admins)`,
      [
        crypto.randomUUID(),
        normalizeEmail(email),
        fullName.trim(),
        passwordHash,
        new Date().toISOString(),
      ],
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (!message.includes("UNIQUE")) throw error;
  }
}

export async function migrate(db: Sql): Promise<void> {
  await db.exec(
    `CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL
    )`,
  );
  for (const migration of MIGRATIONS) {
    const existing = await db.get("SELECT id FROM schema_migrations WHERE id = ?", [migration.id]);
    if (existing) continue;
    for (const statement of migration.statements) {
      await db.exec(statement);
    }
    await db.run("INSERT INTO schema_migrations (id, applied_at) VALUES (?, ?)", [
      migration.id,
      new Date().toISOString(),
    ]);
  }
  await seedAdmin(db);
}
