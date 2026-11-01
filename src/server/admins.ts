import { normalizeEmail, normalizeNif } from "@/lib/portal/identity";
import type {
  ActionResult,
  AdminAccount,
  AdminDashboard,
  CommunityRecord,
  OwnerAdminRow,
} from "@/lib/portal/types";
import { hashPassword, verifyPassword } from "@/server/crypto";
import { getDb } from "@/server/db";
import { ownerIdentityError, parseUnitDrafts, replaceUnits } from "@/server/owners";
import {
  createSession,
  destroySession,
  destroySubjectSessions,
  readSession,
} from "@/server/sessions";
import { isRow, rowString, rowStringOrNull } from "@/server/sql";

const LOCK_AFTER = 5;
const LOCK_MS = 15 * 60 * 1000;

type AdminRow = {
  id: string;
  email: string;
  fullName: string;
  passwordHash: string;
  failedAttempts: number;
  lockedUntil: string | null;
};

function asAdmin(value: unknown): AdminRow | null {
  if (!isRow(value)) return null;
  const attempts = value["failedAttempts"];
  return {
    id: rowString(value, "id"),
    email: rowString(value, "email"),
    fullName: rowString(value, "fullName"),
    passwordHash: rowString(value, "passwordHash"),
    failedAttempts: typeof attempts === "number" ? attempts : Number(attempts ?? 0),
    lockedUntil: rowStringOrNull(value, "lockedUntil"),
  };
}

async function findAdminByEmail(email: string): Promise<AdminRow | null> {
  const db = await getDb();
  return asAdmin(
    await db.get(
      `SELECT id, email, full_name AS fullName, password_hash AS passwordHash,
              failed_attempts AS failedAttempts, locked_until AS lockedUntil
       FROM admins WHERE email = ?`,
      [normalizeEmail(email)],
    ),
  );
}

function locked(until: string | null): boolean {
  return until != null && new Date(until).getTime() > Date.now();
}

export async function loginAdmin(
  email: string,
  password: string,
): Promise<ActionResult<AdminAccount>> {
  const admin = await findAdminByEmail(email);
  if (!admin) return { ok: false, error: "El correo o la contraseña no son correctos." };
  if (admin.lockedUntil && !locked(admin.lockedUntil)) {
    const db = await getDb();
    await db.run("UPDATE admins SET failed_attempts = 0, locked_until = NULL WHERE id = ?", [
      admin.id,
    ]);
    admin.failedAttempts = 0;
    admin.lockedUntil = null;
  }
  if (locked(admin.lockedUntil)) {
    return { ok: false, error: "El acceso de administración está bloqueado unos minutos." };
  }
  const matches = await verifyPassword(password, admin.passwordHash);
  if (!matches) {
    const db = await getDb();
    const attempts = admin.failedAttempts + 1;
    if (attempts >= LOCK_AFTER) {
      await db.run("UPDATE admins SET failed_attempts = ?, locked_until = ? WHERE id = ?", [
        attempts,
        new Date(Date.now() + LOCK_MS).toISOString(),
        admin.id,
      ]);
    } else {
      await db.run("UPDATE admins SET failed_attempts = ? WHERE id = ?", [attempts, admin.id]);
    }
    return { ok: false, error: "El correo o la contraseña no son correctos." };
  }
  const db = await getDb();
  await db.run("UPDATE admins SET failed_attempts = 0, locked_until = NULL WHERE id = ?", [
    admin.id,
  ]);
  await createSession("admin", admin.id);
  return { ok: true, data: { id: admin.id, email: admin.email, fullName: admin.fullName } };
}

export async function currentAdmin(): Promise<AdminAccount | null> {
  const session = await readSession("admin");
  if (!session) return null;
  const db = await getDb();
  const row = await db.get("SELECT id, email, full_name AS fullName FROM admins WHERE id = ?", [
    session.id,
  ]);
  if (!isRow(row)) {
    await destroySession();
    return null;
  }
  return {
    id: rowString(row, "id"),
    email: rowString(row, "email"),
    fullName: rowString(row, "fullName"),
  };
}

export async function logoutAdmin(): Promise<{ ok: true }> {
  await destroySession();
  return { ok: true };
}

async function requireAdmin(): Promise<AdminAccount | null> {
  return currentAdmin();
}

async function listCommunities(): Promise<CommunityRecord[]> {
  const db = await getDb();
  const rows = await db.all(
    "SELECT id, name, address FROM communities ORDER BY name COLLATE NOCASE",
  );
  return rows.filter(isRow).map((row) => ({
    id: rowString(row, "id"),
    name: rowString(row, "name"),
    address: rowString(row, "address"),
  }));
}

async function listOwners(): Promise<OwnerAdminRow[]> {
  const db = await getDb();
  const owners = await db.all(
    `SELECT id, nif, full_name AS fullName, email, validated_at AS validatedAt,
            activated_at AS activatedAt, password_hash AS passwordHash, locked_until AS lockedUntil
     FROM owners
     ORDER BY full_name COLLATE NOCASE`,
  );
  const units = await db.all(
    `SELECT u.owner_id AS ownerId, u.id AS id, u.unit_type AS unitType, u.unit_label AS unitLabel,
            c.id AS communityId, c.name AS communityName, c.address AS communityAddress
     FROM owner_units u
     JOIN communities c ON c.id = u.community_id
     ORDER BY c.name, u.unit_label`,
  );
  const byOwner = new Map<string, OwnerAdminRow["units"]>();
  for (const row of units) {
    if (!isRow(row)) continue;
    const ownerId = rowString(row, "ownerId");
    const list = byOwner.get(ownerId) ?? [];
    const unitType = rowString(row, "unitType");
    if (unitType !== "vivienda" && unitType !== "local" && unitType !== "garaje") continue;
    list.push({
      id: rowString(row, "id"),
      communityId: rowString(row, "communityId"),
      communityName: rowString(row, "communityName"),
      communityAddress: rowString(row, "communityAddress"),
      unitType,
      unitLabel: rowString(row, "unitLabel"),
    });
    byOwner.set(ownerId, list);
  }
  return owners.filter(isRow).map((row) => {
    const lockedUntil = rowStringOrNull(row, "lockedUntil");
    return {
      id: rowString(row, "id"),
      nif: rowString(row, "nif"),
      fullName: rowString(row, "fullName"),
      email: rowString(row, "email"),
      validated: rowStringOrNull(row, "validatedAt") != null,
      activated: rowStringOrNull(row, "activatedAt") != null,
      hasPassword: rowStringOrNull(row, "passwordHash") != null,
      locked: lockedUntil != null && new Date(lockedUntil).getTime() > Date.now(),
      units: byOwner.get(rowString(row, "id")) ?? [],
    };
  });
}

export async function loadAdminDashboard(): Promise<AdminDashboard | null> {
  const admin = await requireAdmin();
  if (!admin) return null;
  return {
    admin,
    communities: await listCommunities(),
    owners: await listOwners(),
  };
}

export async function createCommunity(
  name: string,
  address: string,
): Promise<ActionResult<CommunityRecord>> {
  if (!(await requireAdmin())) return { ok: false, error: "No autorizado." };
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 120) {
    return { ok: false, error: "Indique el nombre de la comunidad." };
  }
  const db = await getDb();
  const record: CommunityRecord = {
    id: crypto.randomUUID(),
    name: trimmed,
    address: address.trim().slice(0, 200),
  };
  await db.run("INSERT INTO communities (id, name, address, created_at) VALUES (?, ?, ?, ?)", [
    record.id,
    record.name,
    record.address,
    new Date().toISOString(),
  ]);
  return { ok: true, data: record };
}

export async function deleteCommunity(id: string): Promise<ActionResult<{ id: string }>> {
  if (!(await requireAdmin())) return { ok: false, error: "No autorizado." };
  const db = await getDb();
  const used = await db.get("SELECT id FROM owner_units WHERE community_id = ? LIMIT 1", [id]);
  if (used) {
    return { ok: false, error: "Hay propietarios asignados a esta comunidad." };
  }
  const result = await db.run("DELETE FROM communities WHERE id = ?", [id]);
  if (result.changes === 0) return { ok: false, error: "La comunidad no existe." };
  return { ok: true, data: { id } };
}

export async function saveOwner(input: {
  id?: string;
  nif: string;
  fullName: string;
  email: string;
  validate: boolean;
  units: unknown;
}): Promise<ActionResult<{ id: string }>> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "No autorizado." };
  const identity = ownerIdentityError(input.nif, input.fullName, input.email);
  if (identity) return { ok: false, error: identity };
  const units = parseUnitDrafts(input.units);
  if (typeof units === "string") return { ok: false, error: units };

  const db = await getDb();
  const nif = normalizeNif(input.nif);
  const email = normalizeEmail(input.email);
  const fullName = input.fullName.trim();
  const now = new Date().toISOString();
  const existingId = input.id?.trim() ? input.id.trim() : undefined;
  const duplicate = await db.get("SELECT id FROM owners WHERE nif = ?", [nif]);
  const duplicateId = isRow(duplicate) ? rowString(duplicate, "id") : null;
  if (duplicateId && duplicateId !== existingId) {
    return { ok: false, error: "Ese NIF o NIE ya está dado de alta." };
  }

  const ownerId = existingId ?? crypto.randomUUID();
  if (existingId) {
    const existing = await db.get("SELECT id FROM owners WHERE id = ?", [existingId]);
    if (!existing) return { ok: false, error: "El propietario no existe." };
    await db.run(
      "UPDATE owners SET nif = ?, full_name = ?, email = ?, updated_at = ? WHERE id = ?",
      [nif, fullName, email, now, existingId],
    );
    if (input.validate) {
      await db.run(
        "UPDATE owners SET validated_at = COALESCE(validated_at, ?), validated_by = COALESCE(validated_by, ?) WHERE id = ?",
        [now, admin.id, existingId],
      );
    }
  } else {
    await db.run(
      `INSERT INTO owners (
         id, nif, full_name, email, validated_at, validated_by, password_hash, activated_at,
         failed_attempts, locked_until, created_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, NULL, NULL, 0, NULL, ?, ?)`,
      [
        ownerId,
        nif,
        fullName,
        email,
        input.validate ? now : null,
        input.validate ? admin.id : null,
        now,
        now,
      ],
    );
  }

  const unitError = await replaceUnits(db, ownerId, units);
  if (unitError) {
    if (!existingId) {
      await db.run("DELETE FROM owner_units WHERE owner_id = ?", [ownerId]);
      await db.run("DELETE FROM owners WHERE id = ?", [ownerId]);
    }
    return { ok: false, error: unitError };
  }
  return { ok: true, data: { id: ownerId } };
}

export async function setOwnerValidation(
  id: string,
  validated: boolean,
): Promise<ActionResult<{ id: string }>> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "No autorizado." };
  const db = await getDb();
  const now = new Date().toISOString();
  const result = validated
    ? await db.run(
        "UPDATE owners SET validated_at = ?, validated_by = ?, updated_at = ? WHERE id = ?",
        [now, admin.id, now, id],
      )
    : await db.run(
        "UPDATE owners SET validated_at = NULL, validated_by = NULL, updated_at = ? WHERE id = ?",
        [now, id],
      );
  if (result.changes === 0) return { ok: false, error: "El propietario no existe." };
  if (!validated) await destroySubjectSessions("owner", id);
  return { ok: true, data: { id } };
}

export async function removeOwner(id: string): Promise<ActionResult<{ id: string }>> {
  if (!(await requireAdmin())) return { ok: false, error: "No autorizado." };
  const db = await getDb();
  await destroySubjectSessions("owner", id);
  await db.run("DELETE FROM email_tokens WHERE owner_id = ?", [id]);
  await db.run("DELETE FROM owner_units WHERE owner_id = ?", [id]);
  const result = await db.run("DELETE FROM owners WHERE id = ?", [id]);
  if (result.changes === 0) return { ok: false, error: "El propietario no existe." };
  return { ok: true, data: { id } };
}
