import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GlassCard } from "@/components/GlassCard";
import dashboardImg from "@/assets/dashboard.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Fincas Verco — Administración de Comunidades de Propietarios" },
      { name: "description", content: "Gestionamos tu comunidad con tranquilidad. Contabilidad transparente, mantenimiento ágil y atención cercana para propietarios de toda España." },
      { property: "og:title", content: "Fincas Verco — Administración de Comunidades de Propietarios" },
      { property: "og:description", content: "Gestionamos tu comunidad con tranquilidad. Contabilidad transparente, mantenimiento ágil y atención cercana." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen bg-frost-hero text-foreground antialiased">
      <Header />

      <main className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        {/* Hero */}
        <section className="grid items-center gap-8 pt-10 lg:grid-cols-12 lg:pt-14">
          <div className="lg:col-span-7">
            <span className="glass inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              Administración de Fincas
            </span>
            <h1 className="mt-6 font-display text-4xl leading-[1.05] tracking-tight text-balance sm:text-5xl md:text-6xl">
              Tu comunidad en <span className="text-primary">buenas manos</span>.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground text-pretty">
              Somos Fincas Verco. Contabilidad transparente, mantenimiento ágil y atención cercana para propietarios.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/contacto"
                className="inline-flex items-center rounded-xl bg-ink px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-ink/20 transition-colors hover:bg-ink/90"
              >
                Hablar con un asesor
              </Link>
              <Link
                to="/servicios"
                className="glass inline-flex items-center rounded-xl px-6 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-white/60"
              >
                Ver servicios
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <GlassCard className="rounded-3xl p-4 sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold">Portal del propietario</span>
                <span className="text-xs text-muted-foreground">Cuota de enero</span>
              </div>
              <img
                src={dashboardImg}
                alt="Panel de gestión de comunidades de propietarios"
                width={1024}
                height={640}
                className="w-full rounded-2xl object-cover"
                loading="eager"
              />
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Comunidad · Torre Mirador</span>
                  <span className="font-semibold text-foreground">Pendiente</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Comunidad · Ático 4B</span>
                  <span className="font-semibold text-emerald-600">Al corriente</span>
                </div>
              </div>
            </GlassCard>
          </div>
        </section>

        {/* Services preview */}
        <section className="mt-16 grid gap-6 md:grid-cols-3">
          <GlassCard className="p-6">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/15 font-display text-lg text-primary">
              1
            </div>
            <h3 className="mt-4 font-display text-xl text-foreground">Contabilidad clara</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
              Presupuestos, cuotas y liquidaciones con trazabilidad total y cero sorpresas para los vecinos.
            </p>
          </GlassCard>
          <GlassCard className="p-6">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-secondary/30 font-display text-lg text-primary">
              2
            </div>
            <h3 className="mt-4 font-display text-xl text-foreground">Mantenimiento ágil</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
              Red de proveedores de confianza para ascensores, climatización, fachadas y zonas comunes.
            </p>
          </GlassCard>
          <GlassCard className="p-6">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/15 font-display text-lg text-primary">
              3
            </div>
            <h3 className="mt-4 font-display text-xl text-foreground">Atención 24/7</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
              Línea de incidencias y portal digital para propietarios y administradores siempre disponible.
            </p>
          </GlassCard>
        </section>

        {/* Trust strip */}
        <section className="mt-16">
          <GlassCard className="px-6 py-8 text-center md:px-12 md:py-10">
            <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Compromiso Fincas Verco</p>
            <div className="mt-4 flex flex-col items-center justify-center gap-4 text-sm text-muted-foreground md:flex-row md:gap-8">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary"></span>
                Cumplimiento LOPD
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary"></span>
                Seguros de responsabilidad civil
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary"></span>
                Colegiados desde 1998
              </span>
            </div>
          </GlassCard>
        </section>
      </main>

      <Footer />
    </div>
  );
}
