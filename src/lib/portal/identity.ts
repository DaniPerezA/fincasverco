const NIF_LETTERS = "TRWAGMYFPDXBNJZSQVHLCKE";

export type UnitType = "vivienda" | "local" | "garaje";

export const UNIT_TYPES: UnitType[] = ["vivienda", "local", "garaje"];

export const UNIT_LABELS: Record<UnitType, string> = {
  vivienda: "Vivienda",
  local: "Local comercial",
  garaje: "Plaza de garaje",
};

export function normalizeNif(input: string): string {
  return input.toUpperCase().replace(/[\s.-]/g, "");
}

export function nifError(input: string): string | null {
  const nif = normalizeNif(input);
  if (!nif) return "Introduzca su NIF o NIE.";

  let digits = "";
  if (/^\d{8}[A-Z]$/.test(nif)) {
    digits = nif.slice(0, 8);
  } else if (/^[XYZ]\d{7}[A-Z]$/.test(nif)) {
    const prefix = nif[0] === "Y" ? "1" : nif[0] === "Z" ? "2" : "0";
    digits = prefix + nif.slice(1, 8);
  } else {
    return "El NIF o NIE no tiene un formato válido.";
  }

  const letter = NIF_LETTERS[Number(digits) % 23];
  if (!letter || nif.at(-1) !== letter) {
    return "La letra del NIF o NIE no es correcta.";
  }
  return null;
}

export function emailError(input: string): string | null {
  const email = input.trim().toLowerCase();
  if (!email) return "Introduzca un correo electrónico.";
  if (email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "El correo electrónico no es válido.";
  }
  return null;
}

export function normalizeEmail(input: string): string {
  return input.trim().toLowerCase();
}

export function maskEmail(email: string): string {
  const at = email.indexOf("@");
  if (at <= 0) return "su correo";
  const user = email.slice(0, at);
  const domain = email.slice(at + 1);
  return `${user.slice(0, 1)}***@${domain}`;
}

export function isUnitType(value: string): value is UnitType {
  return value === "vivienda" || value === "local" || value === "garaje";
}
