import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { SiteFrame } from "@/components/SiteFrame";
import { GlassCard } from "@/components/GlassCard";
import { UNIT_LABELS } from "@/lib/portal/identity";
import { getOwnerAccount, logoutOwner } from "@/lib/portal/api";
import { quietButtonClass } from "@/components/portal/ui";

export const Route = createFileRoute("/portal/cuenta")({
  beforeLoad: async () => {
    const account = await getOwnerAccount();
    if (!account) throw redirect({ to: "/portal" });
    return { account };
  },
  head: () => ({
    meta: [{ title: "Mi cuenta — Portal del propietario" }],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { account } = Route.useRouteContext();
  const navigate = useNavigate();
  const groups = new Map<string, typeof account.units>();
  for (const unit of account.units) {
    const key = `${unit.communityName}·${unit.communityAddress}`;
    const list = groups.get(key) ?? [];
    list.push(unit);
    groups.set(key, list);
  }

  async function onLogout() {
    await logoutOwner({ data: {} });
    await navigate({ to: "/portal" });
  }

  return (
    <SiteFrame>
      <section className="mx-auto max-w-3xl pt-10 lg:pt-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              Su acceso
            </span>
            <h1 className="mt-3 font-display text-4xl tracking-tight">Hola, {account.fullName}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {account.nif} · {account.email}
            </p>
          </div>
          <button type="button" onClick={onLogout} className={quietButtonClass}>
            Cerrar sesión
          </button>
        </div>
        <div className="mt-8 grid gap-4">
          {[...groups.entries()].map(([key, units]) => {
            const first = units[0];
            if (!first) return null;
            return (
              <GlassCard key={key} className="p-6">
                <h2 className="font-display text-2xl">{first.communityName}</h2>
                {first.communityAddress ? (
                  <p className="mt-1 text-sm text-muted-foreground">{first.communityAddress}</p>
                ) : null}
                <ul className="mt-4 space-y-2 text-sm">
                  {units.map((unit) => (
                    <li
                      key={unit.id}
                      className="flex justify-between gap-4 rounded-xl bg-white/50 px-3 py-2"
                    >
                      <span>{UNIT_LABELS[unit.unitType]}</span>
                      <span className="font-medium">{unit.unitLabel}</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            );
          })}
          {account.units.length === 0 ? (
            <GlassCard className="p-6 text-sm text-muted-foreground">
              No hay inmuebles asociados a su NIF. Contacte con la administración.
            </GlassCard>
          ) : null}
        </div>
        <p className="mt-8 text-sm text-muted-foreground">
          <Link to="/" className="font-medium text-primary hover:underline">
            Volver al inicio
          </Link>
        </p>
      </section>
    </SiteFrame>
  );
}
