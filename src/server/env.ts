type Proc = { env?: Record<string, string | undefined>; cwd?: () => string };

let dotenvLoaded = false;

function proc(): Proc | undefined {
  return (globalThis as { process?: Proc }).process;
}

export function readEnv(name: string): string | undefined {
  const value = proc()?.env?.[name];
  if (value == null || value.trim() === "") return undefined;
  return value;
}

function setEnvIfMissing(name: string, value: string) {
  const current = proc();
  if (!current) return;
  current.env ??= {};
  if (current.env[name] === undefined) current.env[name] = value;
}

async function loadDotenv(): Promise<void> {
  if (dotenvLoaded) return;
  dotenvLoaded = true;
  try {
    const fs = (await import("node:fs")) as {
      existsSync(path: string): boolean;
      readFileSync(path: string, encoding: "utf8"): string;
    };
    const path = (await import("node:path")) as {
      resolve(...parts: string[]): string;
    };
    const file = path.resolve(proc()?.cwd?.() ?? ".", ".env");
    if (!fs.existsSync(file)) return;
    for (const line of fs.readFileSync(file, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      setEnvIfMissing(key, value);
    }
  } catch (error) {
    console.error("[portal] No se ha podido leer .env", error);
  }
}

export async function env(name: string): Promise<string | undefined> {
  await loadDotenv();
  return readEnv(name);
}
