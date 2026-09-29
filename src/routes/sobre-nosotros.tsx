import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GlassCard } from "@/components/GlassCard";
import teamImg from "@/assets/team.jpg";

export const Route = createFileRoute("/sobre-nosotros")({
  head: () => ({
    meta: [
      { title: "Así trabajamos — Fincas Verco" },
      { name: "description", content: "Conozca el método de gestión de Fincas Verco: transparencia, atención personalizada, control de costes y seguimiento de cada asunto." },
      { property: "og:title", content: "Así trabajamos — Fincas Verco" },
      { property: "og:description", content: "Transparencia, atención personalizada, control de costes y seguimiento de cada asunto de su comunidad." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AsiTrabajamosPage,
});

const steps = [
  {
    number: "01",
    title: "Conocemos su comunidad",
    description: "Analizamos las características, necesidades y problemas de la finca.",
  },
  {
    number: "02",
    title: "Organizamos la gestión",
    description: "Revisamos contratos, proveedores, cuentas, mantenimiento y obligaciones.",
  },
  {
    number: "03",
    title: "Atendemos las incidencias",
    description: "Gestionamos averías, siniestros, presupuestos y actuaciones necesarias.",
  },
  {
    number: "04",
    title: "Informamos a los propietarios",
    description: "La comunidad dispone de información clara y accesible sobre su gestión.",
  },
  {
    number: "05",
    title: "Hacemos seguimiento",
    description: "No nos limitamos a tramitar: comprobamos que los asuntos quedan solucionados.",
  },
];

function AsiTrabajamosPage() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Header />

      <main className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        {/* Hero */}
        <section className="grid items-center gap-10 pt-10 lg:grid-cols-2 lg:pt-14">
          <div>
            <span className="glass inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              Así trabajamos
            </span>
            <h1 className="mt-6 font-display text-4xl leading-[1.05] tracking-tight text-balance sm:text-5xl md:text-6xl">
              Un método claro para gestionar su comunidad.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground text-pretty">
              Cinco pasos que definen nuestra forma de trabajar, desde el primer día hasta el seguimiento de cada asunto.
            </p>
          </div>
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
        </section>

        {/* Steps */}
        <section className="mt-16 space-y-4">
          {steps.map((step) => (
            <GlassCard key={step.number} className="flex flex-col gap-3 p-6 sm:flex-row sm:items-start sm:gap-6">
              <span className="font-display text-2xl text-primary sm:w-16 sm:shrink-0">{step.number}</span>
              <div>
                <h2 className="font-display text-xl text-foreground">{step.title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground text-pretty">
                  {step.description}
                </p>
              </div>
            </GlassCard>
          ))}
        </section>

        {/* CTA */}
        <section className="mt-16">
          <GlassCard className="px-6 py-10 text-center md:px-14 md:py-14">
            <h2 className="font-display text-3xl tracking-tight text-foreground text-balance sm:text-4xl">
              ¿Quiere que gestionemos su comunidad?
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
