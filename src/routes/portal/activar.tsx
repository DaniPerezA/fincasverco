import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFrame } from "@/components/SiteFrame";
import { GlassCard } from "@/components/GlassCard";
import { activateAccount } from "@/lib/portal/api";
import { FormNote, primaryButtonClass } from "@/components/portal/ui";

export const Route = createFileRoute("/portal/activar")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search["token"] === "string" ? search["token"] : "",
  }),
  head: () => ({
    meta: [{ title: "Activar cuenta — Fincas Verco" }],
  }),
  component: ActivatePage,
});

function ActivatePage() {
  const { token } = Route.useSearch();
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onActivate() {
    setBusy(true);
    setError("");
    try {
      const result = await activateAccount({ data: { token } });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDone(true);
    } catch {
      setError("No se ha podido activar la cuenta.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SiteFrame>
      <section className="mx-auto max-w-xl pt-10 lg:pt-14">
        <GlassCard className="space-y-4 p-6 sm:p-8">
          <h1 className="font-display text-3xl tracking-tight">Activar la cuenta</h1>
          {done ? (
            <>
              <FormNote tone="ok">
                La cuenta ya está activa. Ya puede entrar con su NIF y su contraseña.
              </FormNote>
              <Link to="/portal" className={primaryButtonClass}>
                Ir al portal
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Confirme la activación. El enlace del correo no se consume solo al abrirlo.
              </p>
              {!token ? (
                <FormNote tone="error">El enlace no incluye un código de activación.</FormNote>
              ) : null}
              {error ? <FormNote tone="error">{error}</FormNote> : null}
              <button
                type="button"
                disabled={busy || !token}
                onClick={onActivate}
                className={primaryButtonClass}
              >
                {busy ? "Activando…" : "Activar mi cuenta"}
              </button>
            </>
          )}
        </GlassCard>
      </section>
    </SiteFrame>
  );
}
