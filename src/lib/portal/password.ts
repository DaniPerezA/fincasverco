export type PasswordRule = {
  id: string;
  label: string;
  ok: boolean;
};

export function passwordRules(password: string): PasswordRule[] {
  const chars = [...password];
  return [
    {
      id: "length",
      label: "Al menos 10 caracteres",
      ok: chars.length >= 10 && chars.length <= 200,
    },
    { id: "upper", label: "Una mayúscula", ok: /\p{Lu}/u.test(password) },
    { id: "lower", label: "Una minúscula", ok: /\p{Ll}/u.test(password) },
    { id: "digit", label: "Un número", ok: /\p{N}/u.test(password) },
    { id: "letter", label: "Una letra", ok: /\p{L}/u.test(password) },
    {
      id: "symbol",
      label: "Un símbolo",
      ok: [...password].some((char) => !/\p{L}|\p{N}|\s/u.test(char)),
    },
  ];
}

export function passwordError(password: string): string | null {
  if (/\s/u.test(password)) return "La contraseña no puede contener espacios.";
  if ([...password].length > 200) return "La contraseña no puede superar los 200 caracteres.";
  const pending = passwordRules(password).filter((rule) => !rule.ok);
  if (pending.length === 0) return null;
  return `La contraseña debe incluir: ${pending.map((rule) => rule.label.toLowerCase()).join(", ")}.`;
}
