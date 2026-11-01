import {
  emailError,
  isUnitType,
  maskEmail,
  nifError,
  normalizeEmail,
  normalizeNif,
  type UnitType,
} from "@/lib/portal/identity";
import { passwordError } from "@/lib/portal/password";
import type {
  ActionResult,
  MailNotice,
  OwnerAccount,
  OwnerLookup,
  OwnerUnitView,
  UnitDraft,
} from "@/lib/portal/types";
import {
  dummyPasswordHash,
  hashPassword,
  randomToken,
  sha256,
  verifyPassword,
} from "@/server/crypto";
import { getDb } from "@/server/db";
import { escapeHtml, portalOrigin, sendMail } from "@/server/mail";
import {
  createSession,
  destroySession,
  destroySubjectSessions,
  readSession,
} from "@/server/sessions";
import { isRow, rowString, rowStringOrNull, type Sql } from "@/server/sql";

const LOCK_AFTER = 5;
const LOCK_MS = 15 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;

type OwnerRow = {
  id: string;
  nif: string;
  fullName: string;
  email: string;
  validatedAt: string | null;
  passwordHash: string | null;
  activatedAt: string | null;
  failedAttempts: number;
  lockedUntil: string | null;
};

function asOwner(value: unknown): OwnerRow | null {
  if (!isRow(value)) return null;
  const attempts = value["failedAttempts"];
  return {
    id: rowString(value, "id"),
    nif: rowString(value, "nif"),
    fullName: rowString(value, "fullName"),
    email: rowString(value, "email"),
    validatedAt: rowStringOrNull(value, "validatedAt"),
    passwordHash: rowStringOrNull(value, "passwordHash"),
    activatedAt: rowStringOrNull(value, "activatedAt"),
    failedAttempts: typeof attempts === "number" ? attempts : Number(attempts ?? 0),
    lockedUntil: rowStringOrNull(value, "lockedUntil"),
  };
}

const OWNER_COLUMNS = `id, nif, full_name AS fullName, email, validated_at AS validatedAt,
  password_hash AS passwordHash, activated_at AS activatedAt,
  failed_attempts AS failedAttempts, locked_until AS lockedUntil`;

async function findOwnerByNif(nif: string): Promise<OwnerRow | null> {
  const db = await getDb();
  return asOwner(await db.get(`SELECT ${OWNER_COLUMNS} FROM owners WHERE nif = ?`, [nif]));
}

async function findOwnerById(id: string): Promise<OwnerRow | null> {
  const db = await getDb();
  return asOwner(await db.get(`SELECT ${OWNER_COLUMNS} FROM owners WHERE id = ?`, [id]));
}

function isLocked(lockedUntil: string | null): boolean {
  return lockedUntil != null && new Date(lockedUntil).getTime() > Date.now();
}

async function clearExpiredLock(owner: OwnerRow): Promise<OwnerRow> {
  if (!owner.lockedUntil || isLocked(owner.lockedUntil)) return owner;
  const db = await getDb();
  await db.run("UPDATE owners SET failed_attempts = 0, locked_until = NULL WHERE id = ?", [
    owner.id,
  ]);
  return { ...owner, failedAttempts: 0, lockedUntil: null };
}

async function unitsFor(ownerId: string): Promise<OwnerUnitView[]> {
  const db = await getDb();
  const rows = await db.all(
    `SELECT u.id AS id, u.unit_type AS unitType, u.unit_label AS unitLabel,
            c.id AS communityId, c.name AS communityName, c.address AS communityAddress
     FROM owner_units u
     JOIN communities c ON c.id = u.community_id
     WHERE u.owner_id = ?
     ORDER BY c.name, u.unit_type, u.unit_label`,
    [ownerId],
  );
  return rows.filter(isRow).map((row) => ({
    id: rowString(row, "id"),
    communityId: rowString(row, "communityId"),
    communityName: rowString(row, "communityName"),
    communityAddress: rowString(row, "communityAddress"),
    unitType: parseUnitType(rowString(row, "unitType")),
    unitLabel: rowString(row, "unitLabel"),
  }));
}

function parseUnitType(value: string): UnitType {
  if (!isUnitType(value)) throw new Error("Tipo de inmueble desconocido");
  return value;
}

function lookupFrom(owner: OwnerRow | null, nifInput: string): OwnerLookup {
  const invalid = nifError(nifInput);
  if (invalid) return { status: "invalid", error: invalid };
  if (!owner) return { status: "unknown" };
  if (!owner.validatedAt) return { status: "not_validated" };
  if (isLocked(owner.lockedUntil)) {
    return { status: "locked", lockedUntil: owner.lockedUntil ?? "" };
  }
  const maskedEmail = maskEmail(owner.email);
  if (!owner.passwordHash) return { status: "needs_password", maskedEmail };
  if (!owner.activatedAt) return { status: "needs_activation", maskedEmail };
  return { status: "ready", maskedEmail };
}

export async function lookupOwnerStatus(nifInput: string): Promise<OwnerLookup> {
  const invalid = nifError(nifInput);
  if (invalid) return { status: "invalid", error: invalid };
  const found = await findOwnerByNif(normalizeNif(nifInput));
  if (!found) return { status: "unknown" };
  return lookupFrom(await clearExpiredLock(found), nifInput);
}

type TokenPurpose = "activate" | "reset";

function purposeCopy(
  purpose: TokenPurpose,
  name: string,
  link: string,
): { subject: string; text: string; html: string } {
  const safeName = escapeHtml(name);
  const safeLink = escapeHtml(link);
  if (purpose === "activate") {
    const subject = "Active su cuenta del portal de Fincas Verco";
    const text = [
      `Hola ${name},`,
      "",
      "Un administrador ha validado su NIF o NIE en el portal de propietarios de Fincas Verco.",
      "Abra este enlace para activar la cuenta. Caduca en 48 horas:",
      "",
      link,
      "",
      "Si usted no ha solicitado el acceso, ignore este mensaje.",
      "",
      "Fincas Verco",
    ].join("\n");
    const html = `<p>Hola ${safeName},</p><p>Un administrador ha validado su NIF o NIE en el portal de propietarios de Fincas Verco.</p><p><a href="${safeLink}">Activar mi cuenta</a></p><p>El enlace caduca en 48 horas. Si usted no ha solicitado el acceso, ignore este mensaje.</p><p>Fincas Verco</p>`;
    return { subject, text, html };
  }
  const subject = "Restablecer la contraseña del portal de Fincas Verco";
  const text = [
    `Hola ${name},`,
    "",
    "Hemos recibido una solicitud para cambiar la contraseña de su portal de propietario.",
    "Abra este enlace para elegir una nueva. Caduca en 1 hora:",
    "",
    link,
    "",
    "Si usted no ha sido, ignore este mensaje. Su contraseña actual seguirá siendo válida.",
    "",
    "Fincas Verco",
  ].join("\n");
  const html = `<p>Hola ${safeName},</p><p>Hemos recibido una solicitud para cambiar la contraseña de su portal de propietario.</p><p><a href="${safeLink}">Elegir una contraseña nueva</a></p><p>El enlace caduca en 1 hora. Si usted no ha sido, ignore este mensaje.</p><p>Fincas Verco</p>`;
  return { subject, text, html };
}

async function latestTokenAge(
  db: Sql,
  ownerId: string,
  purpose: TokenPurpose,
): Promise<number | null> {
  const row = await db.get(
    `SELECT created_at AS createdAt, used_at AS usedAt
     FROM email_tokens
     WHERE owner_id = ? AND purpose = ?
     ORDER BY created_at DESC
     LIMIT 1`,
    [ownerId, purpose],
  );
  if (!isRow(row) || rowStringOrNull(row, "usedAt")) return null;
  const createdAt = rowString(row, "createdAt");
  return Date.now() - new Date(createdAt).getTime();
}

async function issueToken(
  owner: OwnerRow,
  purpose: TokenPurpose,
): Promise<ActionResult<MailNotice>> {
  const db = await getDb();
  const age = await latestTokenAge(db, owner.id, purpose);
  if (age != null && age < RESEND_COOLDOWN_MS) {
    const { env } = await import("@/server/env");
    return {
      ok: true,
      data: { maskedEmail: maskEmail(owner.email), devMail: !(await env("RESEND_API_KEY")) },
    };
  }
  const now = new Date();
  await db.run(
    `UPDATE email_tokens SET used_at = ? WHERE owner_id = ? AND purpose = ? AND used_at IS NULL`,
    [now.toISOString(), owner.id, purpose],
  );
  const token = randomToken();
  const hours = purpose === "activate" ? 48 : 1;
  const expires = new Date(now.getTime() + hours * 60 * 60 * 1000);
  const tokenId = crypto.randomUUID();
  await db.run(
    `INSERT INTO email_tokens (id, owner_id, purpose, token_hash, expires_at, used_at, created_at)
     VALUES (?, ?, ?, ?, ?, NULL, ?)`,
    [tokenId, owner.id, purpose, await sha256(token), expires.toISOString(), now.toISOString()],
  );
  const origin = await portalOrigin();
  const path = purpose === "activate" ? "/portal/activar" : "/portal/restablecer";
  const link = `${origin}${path}?token=${encodeURIComponent(token)}`;
  const copy = purposeCopy(purpose, owner.fullName, link);
  try {
    const sent = await sendMail({ to: owner.email, ...copy });
    return { ok: true, data: { maskedEmail: maskEmail(owner.email), devMail: sent.devMail } };
  } catch (error) {
    await db.run("DELETE FROM email_tokens WHERE id = ?", [tokenId]);
    console.error(error);
    return {
      ok: false,
      error: "No se ha podido enviar el correo. Inténtelo de nuevo en unos minutos.",
    };
  }
}

export async function registerOwnerPassword(
  nifInput: string,
  password: string,
  confirm: string,
): Promise<ActionResult<MailNotice>> {
  const invalid = nifError(nifInput);
  if (invalid) return { ok: false, error: invalid };
  if (password !== confirm) return { ok: false, error: "Las dos contraseñas no coinciden." };
  const policy = passwordError(password);
  if (policy) return { ok: false, error: policy };

  const owner = await findOwnerByNif(normalizeNif(nifInput));
  if (!owner) {
    return {
      ok: false,
      error:
        "Este NIF o NIE no consta en los registros de Fincas Verco. Contacte con la administración para que validen su alta.",
    };
  }
  if (!owner.validatedAt) {
    return {
      ok: false,
      error: "Su NIF o NIE todavía no ha sido validado por un administrador.",
    };
  }
  if (owner.passwordHash) {
    return {
      ok: false,
      error: "Ya ha elegido una contraseña. Entre en el portal o restablézcala si no la recuerda.",
    };
  }

  const db = await getDb();
  const now = new Date().toISOString();
  await db.run(
    "UPDATE owners SET password_hash = ?, updated_at = ?, failed_attempts = 0, locked_until = NULL WHERE id = ?",
    [await hashPassword(password), now, owner.id],
  );
  const refreshed = await findOwnerById(owner.id);
  if (!refreshed) return { ok: false, error: "No se ha podido crear la cuenta." };
  return issueToken(refreshed, "activate");
}

export async function resendActivation(nifInput: string): Promise<ActionResult<MailNotice>> {
  const invalid = nifError(nifInput);
  if (invalid) return { ok: false, error: invalid };
  const owner = await findOwnerByNif(normalizeNif(nifInput));
  if (!owner?.validatedAt || !owner.passwordHash) {
    return { ok: false, error: "No hay una cuenta pendiente de activación con ese NIF o NIE." };
  }
  if (owner.activatedAt) {
    return { ok: false, error: "La cuenta ya está activada. Puede entrar con su contraseña." };
  }
  return issueToken(owner, "activate");
}

async function registerFailure(owner: OwnerRow): Promise<string> {
  const attempts = owner.failedAttempts + 1;
  const db = await getDb();
  if (attempts >= LOCK_AFTER) {
    const until = new Date(Date.now() + LOCK_MS).toISOString();
    await db.run("UPDATE owners SET failed_attempts = ?, locked_until = ? WHERE id = ?", [
      attempts,
      until,
      owner.id,
    ]);
    return `Demasiados intentos. El acceso queda bloqueado hasta ${formatWhen(until)}.`;
  }
  await db.run("UPDATE owners SET failed_attempts = ? WHERE id = ?", [attempts, owner.id]);
  return "La contraseña no es correcta.";
}

function formatWhen(iso: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Europe/Madrid",
  }).format(new Date(iso));
}

export async function authenticateOwner(
  nifInput: string,
  password: string,
): Promise<ActionResult<{ ownerId: string; fullName: string }>> {
  const invalid = nifError(nifInput);
  if (invalid) return { ok: false, error: invalid };
  const found = await findOwnerByNif(normalizeNif(nifInput));
  const owner = found ? await clearExpiredLock(found) : null;
  if (!owner?.passwordHash || !owner.validatedAt) {
    await verifyPassword(password, await dummyPasswordHash());
    if (!owner) {
      return {
        ok: false,
        error:
          "Este NIF o NIE no consta como propietario validado. Contacte con la administración.",
      };
    }
    if (!owner.validatedAt) {
      return { ok: false, error: "Un administrador todavía no ha validado su acceso." };
    }
    return { ok: false, error: "Todavía no ha elegido una contraseña." };
  }
  if (isLocked(owner.lockedUntil)) {
    return {
      ok: false,
      error: `El acceso está bloqueado hasta ${formatWhen(owner.lockedUntil ?? "")} por varios intentos fallidos.`,
    };
  }
  const matches = await verifyPassword(password, owner.passwordHash);
  if (!matches) return { ok: false, error: await registerFailure(owner) };
  if (!owner.activatedAt) {
    return {
      ok: false,
      error: "Su cuenta todavía no está activada. Revise el correo de activación o solicite otro.",
    };
  }
  const db = await getDb();
  await db.run("UPDATE owners SET failed_attempts = 0, locked_until = NULL WHERE id = ?", [
    owner.id,
  ]);
  return { ok: true, data: { ownerId: owner.id, fullName: owner.fullName } };
}

export async function loginOwner(
  nifInput: string,
  password: string,
): Promise<ActionResult<{ fullName: string }>> {
  const result = await authenticateOwner(nifInput, password);
  if (!result.ok) return result;
  await createSession("owner", result.data.ownerId);
  return { ok: true, data: { fullName: result.data.fullName } };
}

export async function requestPasswordReset(nifInput: string): Promise<ActionResult<MailNotice>> {
  const status = await lookupOwnerStatus(nifInput);
  if (status.status === "invalid") return { ok: false, error: status.error };
  if (status.status === "unknown" || status.status === "not_validated") {
    return {
      ok: false,
      error:
        "Este NIF o NIE no consta como propietario validado. Si lo es, contacte con Fincas Verco para que un administrador lo dé de alta.",
    };
  }
  if (status.status === "locked") {
    return {
      ok: false,
      error: `El acceso está bloqueado hasta ${formatWhen(status.lockedUntil)}. Inténtelo más tarde.`,
    };
  }
  if (status.status === "needs_password") {
    return { ok: false, error: "Todavía no ha elegido contraseña. Créela desde el portal." };
  }
  const owner = await findOwnerByNif(normalizeNif(nifInput));
  if (!owner) return { ok: false, error: "No se ha encontrado la cuenta." };
  if (!owner.activatedAt) return issueToken(owner, "activate");
  return issueToken(owner, "reset");
}

function tokenError(): ActionResult<never> {
  return {
    ok: false,
    error: "El enlace no es válido o ha caducado. Solicite uno nuevo desde el portal.",
  };
}

async function consumeToken(
  token: string,
  purpose: TokenPurpose,
): Promise<{ owner: OwnerRow } | null> {
  if (!/^[A-Za-z0-9_-]{20,200}$/.test(token)) return null;
  const db = await getDb();
  const now = new Date().toISOString();
  const row = await db.get(
    `SELECT id, owner_id AS ownerId
     FROM email_tokens
     WHERE token_hash = ? AND purpose = ? AND used_at IS NULL AND expires_at > ?`,
    [await sha256(token), purpose, now],
  );
  if (!isRow(row)) return null;
  const owner = await findOwnerById(rowString(row, "ownerId"));
  if (!owner?.validatedAt) return null;
  await db.run("UPDATE email_tokens SET used_at = ? WHERE id = ?", [now, rowString(row, "id")]);
  return { owner };
}

export async function activateAccount(token: string): Promise<ActionResult<{ nif: string }>> {
  const consumed = await consumeToken(token, "activate");
  if (!consumed) return tokenError();
  const db = await getDb();
  await db.run(
    "UPDATE owners SET activated_at = ?, updated_at = ? WHERE id = ? AND activated_at IS NULL",
    [new Date().toISOString(), new Date().toISOString(), consumed.owner.id],
  );
  return { ok: true, data: { nif: consumed.owner.nif } };
}

export async function resetPassword(
  token: string,
  password: string,
  confirm: string,
): Promise<ActionResult<{ nif: string }>> {
  if (password !== confirm) return { ok: false, error: "Las dos contraseñas no coinciden." };
  const policy = passwordError(password);
  if (policy) return { ok: false, error: policy };
  const consumed = await consumeToken(token, "reset");
  if (!consumed) return tokenError();
  const db = await getDb();
  const now = new Date().toISOString();
  await db.run(
    `UPDATE owners
     SET password_hash = ?, updated_at = ?, failed_attempts = 0, locked_until = NULL
     WHERE id = ?`,
    [await hashPassword(password), now, consumed.owner.id],
  );
  await destroySubjectSessions("owner", consumed.owner.id);
  return { ok: true, data: { nif: consumed.owner.nif } };
}

export async function currentOwner(): Promise<OwnerAccount | null> {
  const session = await readSession("owner");
  if (!session) return null;
  const owner = await findOwnerById(session.id);
  if (!owner?.validatedAt || !owner.activatedAt || !owner.passwordHash) {
    await destroySession();
    return null;
  }
  return {
    id: owner.id,
    nif: owner.nif,
    fullName: owner.fullName,
    email: owner.email,
    units: await unitsFor(owner.id),
  };
}

export async function logoutOwner(): Promise<{ ok: true }> {
  await destroySession();
  return { ok: true };
}

export function parseUnitDrafts(value: unknown): UnitDraft[] | string {
  if (!Array.isArray(value) || value.length === 0) {
    return "Añada al menos un inmueble: vivienda, local comercial o plaza de garaje.";
  }
  if (value.length > 20) return "No se pueden asignar más de 20 inmuebles de una vez.";
  const drafts: UnitDraft[] = [];
  for (const item of value) {
    if (!isRow(item)) return "Hay un inmueble incompleto.";
    const unitTypeValue = item["unitType"];
    const communityValue = item["communityId"];
    const labelValue = item["unitLabel"];
    const unitType = typeof unitTypeValue === "string" ? unitTypeValue : "";
    const communityId = typeof communityValue === "string" ? communityValue.trim() : "";
    const unitLabel = typeof labelValue === "string" ? labelValue.trim() : "";
    if (!isUnitType(unitType)) return "Elija el tipo de inmueble.";
    if (!communityId) return "Elija la comunidad de cada inmueble.";
    if (unitLabel.length < 1 || unitLabel.length > 80) {
      return "Indique la vivienda, el local o la plaza (máximo 80 caracteres).";
    }
    drafts.push({ communityId, unitType, unitLabel });
  }
  const seen = new Set<string>();
  for (const draft of drafts) {
    const key = `${draft.communityId}|${draft.unitType}|${draft.unitLabel.toLowerCase()}`;
    if (seen.has(key)) return "Hay inmuebles repetidos en el alta.";
    seen.add(key);
  }
  return drafts;
}

export async function replaceUnits(
  db: Sql,
  ownerId: string,
  units: UnitDraft[],
): Promise<string | null> {
  for (const unit of units) {
    const community = await db.get("SELECT id FROM communities WHERE id = ?", [unit.communityId]);
    if (!community) return "Alguna comunidad seleccionada ya no existe.";
  }
  const now = new Date().toISOString();
  const ids: string[] = [];
  for (const unit of units) {
    const id = crypto.randomUUID();
    ids.push(id);
    await db.run(
      `INSERT INTO owner_units (id, owner_id, community_id, unit_type, unit_label, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, ownerId, unit.communityId, unit.unitType, unit.unitLabel, now],
    );
  }
  const placeholders = ids.map(() => "?").join(", ");
  await db.run(`DELETE FROM owner_units WHERE owner_id = ? AND id NOT IN (${placeholders})`, [
    ownerId,
    ...ids,
  ]);
  return null;
}

export function ownerIdentityError(
  nifInput: string,
  fullName: string,
  email: string,
): string | null {
  return (
    nifError(nifInput) ??
    (fullName.trim().length < 3 ? "Indique el nombre completo." : null) ??
    emailError(email)
  );
}
