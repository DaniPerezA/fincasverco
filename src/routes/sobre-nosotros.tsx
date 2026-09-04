import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GlassCard } from "@/components/GlassCard";
import teamImg from "@/assets/team.jpg";

export const Route = createFileRoute("/sobre-nosotros")({
  head: () => ({
    meta: [
      { title: "Sobre nosotros — Fincas Verco" },
      { name: "description", content: "Conoce Fincas Verco. Más de 25 años administrando comunidades de propietarios con rigor, transparencia y trato cercano." },
      { property: "og:title", content: "Sobre nosotros — Fincas Verco" },
      { property: "og:description", content: "Más de 25 años administrando comunidades de propietarios con rigor, transparencia y trato cercano." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SobreNosotrosPage,
});

const values = [
  {
    title: "Transparencia",
    description: "Cada céntimo de la comunidad está justificado. Informes claros y accesibles para todos los propietarios.",
  },
  {
    title: "Cercanía",
    description: "Un gestor asignado a cada comunidad. Respondemos con rapidez porque conocemos a nuestros vecinos.",
  },
  {
    title: "Prevención",
    description: "Anticipamos incidencias antes de que se conviertan en gastos mayores: mantenimiento planificado y revisión constante.",
  },
  {
    title: "Rigor",
    description: "Cumplimos la normativa vigente y defendemos los intereses de la comunidad con solidez profesional.",
  },
];

function SobreNosotrosPage() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Header />

      <main className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        {/* Hero */}
        <section className="grid items-center gap-10 pt-10 lg:grid-cols-2 lg:pt-14">
          <div className="overflow-hidden rounded-3xl">
            <img
              src={teamImg}
              alt="Equipo de Fincas Verco en reunión de trabajo"
              width={1200}
              height={800}
              className="h-72 w-full object-cover sm:h-96"
              loading="eager"
            />
          </div>
          <div>
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              Nuestra historia
            </span>
            <h1 className="mt-6 font-display text-4xl leading-[1.05] tracking-tight text-balance sm:text-5xl md:text-6xl">
              La llave de la casa, entregada con confianza.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground text-pretty">
              Desde 1998 acompañamos a presidentes y vecinos en el día a día de sus comunidades. No somos una oficina fría: somos parte de la casa que compartimos.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="mt-16 grid gap-6 sm:grid-cols-3">
          <GlassCard className="p-6 text-center">
            <div className="font-display text-4xl text-foreground">1.240+</div>
            <div className="mt-2 text-sm text-muted-foreground">Comunidades gestionadas</div>
          </GlassCard>
          <GlassCard className="p-6 text-center">
            <div className="font-display text-4xl text-foreground">+25</div>
            <div className="mt-2 text-sm text-muted-foreground">Años de experiencia</div>
          </GlassCard>
          <GlassCard className="p-6 text-center">
            <div className="font-display text-4xl text-foreground">14</div>
            <div className="mt-2 text-sm text-muted-foreground">Profesionales en plantilla</div>
          </GlassCard>
        </section>

        {/* Values */}
        <section className="mt-16">
          <div className="mb-10 text-center">
            <h2 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl">
              Nuestros valores
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Cuatro principios que guían cada decisión que tomamos como administradores.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <GlassCard key={value.title} className="p-6">
                <h3 className="font-display text-xl text-foreground">{value.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
                  {value.description}
                </p>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-16">
          <GlassCard className="px-6 py-10 text-center md:px-14 md:py-14">
            <h2 className="font-display text-3xl tracking-tight text-foreground text-balance sm:text-4xl">
              ¿Quiere conocernos en persona?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Estaremos encantados de recibirle en nuestras oficinas o de llamarle para resolver sus dudas.
            </p>
            <Link
              to="/contacto"
              className="mt-6 inline-flex items-center rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-colors hover:bg-primary/90"
            >
              Contactar con Fincas Verco
            </Link>
          </GlassCard>
        </section>
      </main>

      <Footer />
    </div>
  );
}
