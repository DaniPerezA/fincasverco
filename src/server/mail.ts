import { env } from "@/server/env";

export type OutboundMail = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

async function appOrigin(): Promise<string> {
  const configured = await env("APP_ORIGIN");
  if (configured) {
    const url = new URL(configured);
    if (url.protocol === "http:" || url.protocol === "https:") return url.origin;
  }
  const { getRequest } = await import("@tanstack/react-start/server");
  return new URL(getRequest().url).origin;
}

export async function portalOrigin(): Promise<string> {
  return appOrigin();
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function writeOutbox(mail: OutboundMail): Promise<void> {
  const fs = (await import("node:fs")) as {
    mkdirSync(path: string, options: { recursive: boolean }): void;
    writeFileSync(path: string, data: string): void;
  };
  const path = (await import("node:path")) as {
    resolve(...parts: string[]): string;
  };
  const cwd = (globalThis as { process?: { cwd?: () => string } }).process?.cwd?.() ?? ".";
  const dir = path.resolve(cwd, (await env("PORTAL_OUTBOX_DIR")) ?? ".data/outbox");
  fs.mkdirSync(dir, { recursive: true });
  const file = path.resolve(dir, `${Date.now()}-${crypto.randomUUID()}.json`);
  fs.writeFileSync(file, JSON.stringify({ ...mail, createdAt: new Date().toISOString() }, null, 2));
}

export async function sendMail(mail: OutboundMail): Promise<{ devMail: boolean }> {
  const apiKey = await env("RESEND_API_KEY");
  if (!apiKey) {
    await writeOutbox(mail);
    console.info(`[portal] Correo local para ${mail.to}\nAsunto: ${mail.subject}\n${mail.text}`);
    return { devMail: true };
  }

  const from = (await env("PORTAL_MAIL_FROM")) ?? "Fincas Verco <noreply@fincasverco.es>";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [mail.to],
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    }),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Resend respondió ${response.status}: ${detail.slice(0, 300)}`);
  }
  return { devMail: false };
}
