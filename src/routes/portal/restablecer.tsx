import { useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFrame } from "@/components/SiteFrame";
import { GlassCard } from "@/components/GlassCard";
import { PasswordFields } from "@/components/portal/AccessForm";
import { FormNote, primaryButtonClass } from "@/components/portal/ui";
import { resetPassword } from "@/lib/portal/api";

export const Route = createFileRoute("/portal/restablecer")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search["token"] === "string" ? search["token"] : "",
  }),
  head: () => ({
    meta: [{ title: "Nueva contraseña — Fincas Verco" }],
  }),
  component: ResetPage,
});

function ResetPage() {
  const { token } = Route.useSearch();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await resetPassword({ data: { token, password, confirm } });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDone(true);
    } catch {
      setError("No se ha podido cambiar la contraseña.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SiteFrame>
      <section className="mx-auto max-w-xl pt-10 lg:pt-14">
        <GlassCard className="space-y-4 p-6 sm:p-8">
          <h1 className="font-display text-3xl tracking-tight">Nueva contraseña</h1>
          {done ? (
            <>
              <FormNote tone="ok">
                La contraseña se ha actualizado. Las sesiones anteriores han quedado cerradas.
              </FormNote>
              <Link to="/portal" className={primaryButtonClass}>
                Entrar en el portal
              </Link>
            </>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              {!token ? (
                <FormNote tone="error">El enlace no incluye un código válido.</FormNote>
              ) : null}
              <PasswordFields
                password={password}
                confirm={confirm}
                onPassword={setPassword}
                onConfirm={setConfirm}
              />
              {error ? <FormNote tone="error">{error}</FormNote> : null}
              <button type="submit" disabled={busy || !token} className={primaryButtonClass}>
                {busy ? "Guardando…" : "Guardar contraseña"}
              </button>
            </form>
          )}
        </GlassCard>
      </section>
    </SiteFrame>
  );
}
