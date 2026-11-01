import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFrame } from "@/components/SiteFrame";
import { GlassCard } from "@/components/GlassCard";
import { AccessForm } from "@/components/portal/AccessForm";

export const Route = createFileRoute("/portal/")({
  head: () => ({
    meta: [
      { title: "Portal del propietario — Fincas Verco" },
      {
        name: "description",
        content:
          "Acceso de propietarios de viviendas, locales y plazas de garaje administrados por Fincas Verco.",
      },
    ],
  }),
  component: PortalPage,
});

function PortalPage() {
  return (
    <SiteFrame>
      <section className="mx-auto grid max-w-xl gap-6 pt-10 lg:pt-14">
        <div>
          <span className="glass inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Propietarios
          </span>
          <h1 className="mt-6 font-display text-4xl tracking-tight text-balance sm:text-5xl">
            Portal del propietario
          </h1>
          <p className="mt-4 text-muted-foreground text-pretty">
            {import.meta.env["VITE_STATIC_HOST"] === "true"
              ? "El portal identifica a los propietarios de viviendas, locales comerciales y plazas de garaje administrados por Fincas Verco."
              : "Entre con su NIF o NIE si es propietario de una vivienda, un local comercial o una plaza de garaje en una comunidad administrada por Fincas Verco. La primera vez elegirá la contraseña y activará la cuenta desde el correo. El identificador tiene que estar validado por un administrador."}
          </p>
        </div>
        <GlassCard className="p-6 sm:p-8">
          {import.meta.env["VITE_STATIC_HOST"] === "true" ? (
            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="text-base font-medium text-foreground">
                El acceso de propietarios todavía no está disponible en esta dirección.
              </p>
              <p>
                La identificación, la activación de la cuenta y el cambio de contraseña necesitan el
                servidor de Fincas Verco. Mientras tanto puede llamar al 91 579 55 46 o escribir a
                info@fincasverco.es.
              </p>
            </div>
          ) : (
            <AccessForm />
          )}
        </GlassCard>
        <p className="text-center text-sm text-muted-foreground">
          ¿Aún no consta en los registros?{" "}
          <Link to="/contacto" className="font-medium text-primary hover:underline">
            Escriba a la administración
          </Link>
        </p>
      </section>
    </SiteFrame>
  );
}
