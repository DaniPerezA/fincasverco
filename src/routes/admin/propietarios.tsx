import { createFileRoute, redirect } from "@tanstack/react-router";
import { SiteFrame } from "@/components/SiteFrame";
import { AdminPanel } from "@/components/portal/AdminPanel";
import { getAdminDashboard } from "@/lib/portal/api";

export const Route = createFileRoute("/admin/propietarios")({
  beforeLoad: async () => {
    const dashboard = await getAdminDashboard();
    if (!dashboard) throw redirect({ to: "/admin" });
    return { dashboard };
  },
  head: () => ({
    meta: [{ title: "Propietarios — Administración" }, { name: "robots", content: "noindex" }],
  }),
  component: OwnersAdminPage,
});

function OwnersAdminPage() {
  const { dashboard } = Route.useRouteContext();
  return (
    <SiteFrame>
      <section className="pt-10 lg:pt-14">
        <p className="text-sm text-muted-foreground">Sesión de {dashboard.admin.fullName}</p>
        <h1 className="mt-2 font-display text-4xl tracking-tight">Registros de la compañía</h1>
        <div className="mt-8">
          <AdminPanel dashboard={dashboard} />
        </div>
      </section>
    </SiteFrame>
  );
}
