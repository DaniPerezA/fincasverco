import { useState, type FormEvent } from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { SiteFrame } from "@/components/SiteFrame";
import { GlassCard } from "@/components/GlassCard";
import { loginAdmin, getAdminDashboard } from "@/lib/portal/api";
import { fieldClass, FormNote, Field, primaryButtonClass } from "@/components/portal/ui";

export const Route = createFileRoute("/admin/")({
  beforeLoad: async () => {
    const dashboard = await getAdminDashboard();
    if (dashboard) throw redirect({ to: "/admin/propietarios" });
  },
  head: () => ({
    meta: [{ title: "Administración — Fincas Verco" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await loginAdmin({ data: { email, password } });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      await navigate({ to: "/admin/propietarios" });
    } catch {
      setError("No se ha podido entrar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SiteFrame>
      <section className="mx-auto max-w-md pt-10 lg:pt-14">
        <h1 className="font-display text-4xl tracking-tight">Administración</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Alta y validación de los NIF y NIE de los propietarios.
        </p>
        <GlassCard className="mt-6 p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <Field id="admin-email" label="Correo">
              <input
                id="admin-email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field id="admin-password" label="Contraseña">
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={fieldClass}
              />
            </Field>
            {error ? <FormNote tone="error">{error}</FormNote> : null}
            <button type="submit" disabled={busy} className={primaryButtonClass}>
              {busy ? "Entrando…" : "Entrar"}
            </button>
          </form>
        </GlassCard>
      </section>
    </SiteFrame>
  );
}
