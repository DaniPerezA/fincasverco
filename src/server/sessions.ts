import { randomToken, sha256 } from "@/server/crypto";
import { getDb } from "@/server/db";
import { isRow, rowString } from "@/server/sql";

const COOKIE = "fv_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 14;

type SubjectType = "owner" | "admin";

async function cookieOptions(): Promise<{
  httpOnly: true;
  sameSite: "lax";
  path: string;
  secure: boolean;
  maxAge: number;
}> {
  const { getRequestProtocol } = await import("@tanstack/react-start/server");
  return {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: getRequestProtocol() === "https",
    maxAge: MAX_AGE_SECONDS,
  };
}

export async function createSession(subjectType: SubjectType, subjectId: string): Promise<void> {
  const token = randomToken();
  const now = new Date();
  const expires = new Date(now.getTime() + MAX_AGE_SECONDS * 1000);
  const db = await getDb();
  await db.run(
    `INSERT INTO sessions (id, token_hash, subject_type, subject_id, expires_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      crypto.randomUUID(),
      await sha256(token),
      subjectType,
      subjectId,
      expires.toISOString(),
      now.toISOString(),
    ],
  );
  const { setCookie } = await import("@tanstack/react-start/server");
  setCookie(COOKIE, token, await cookieOptions());
}

export async function readSession(expected: SubjectType): Promise<{ id: string } | null> {
  const { getCookie } = await import("@tanstack/react-start/server");
  const token = getCookie(COOKIE);
  if (!token || token.length < 20 || token.length > 200) return null;
  const db = await getDb();
  const now = new Date().toISOString();
  await db.run("DELETE FROM sessions WHERE expires_at <= ?", [now]);
  const row = await db.get(
    `SELECT subject_id AS subjectId
     FROM sessions
     WHERE token_hash = ? AND subject_type = ? AND expires_at > ?`,
    [await sha256(token), expected, now],
  );
  if (!isRow(row)) return null;
  return { id: rowString(row, "subjectId") };
}

export async function destroySession(): Promise<void> {
  const { getCookie, deleteCookie } = await import("@tanstack/react-start/server");
  const token = getCookie(COOKIE);
  if (token) {
    const db = await getDb();
    await db.run("DELETE FROM sessions WHERE token_hash = ?", [await sha256(token)]);
  }
  const options = await cookieOptions();
  deleteCookie(COOKIE, { path: options.path, secure: options.secure, sameSite: options.sameSite });
}

export async function destroySubjectSessions(
  subjectType: SubjectType,
  subjectId: string,
): Promise<void> {
  const db = await getDb();
  await db.run("DELETE FROM sessions WHERE subject_type = ? AND subject_id = ?", [
    subjectType,
    subjectId,
  ]);
}
