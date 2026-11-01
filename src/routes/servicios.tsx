import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GlassCard } from "@/components/GlassCard";
import buildingImg from "@/assets/building.jpg";

export const Route = createFileRoute("/servicios")({
  head: () => ({
    meta: [
      { title: "Servicios — Fincas Verco" },
      {
        name: "description",
        content:
          "Descubre los servicios de Fincas Verco: administración de fincas, contabilidad, mantenimiento, asesoría jurídica y seguros para comunidades.",
      },
      { property: "og:title", content: "Servicios — Fincas Verco" },
      {
        property: "og:description",
        content:
          "Administración de fincas, contabilidad, mantenimiento, asesoría jurídica y seguros para comunidades de propietarios.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ServiciosPage,
});

const services = [
  {
    number: "01",
    title: "Administración de fincas",
    description:
      "Gestionamos el día a día de la comunidad: convocatoria de juntas, redacción de actas, ejecución de acuerdos y representación ante terceros.",
  },
  {
    number: "02",
    title: "Contabilidad transparente",
    description:
      "Elaboración de presupuestos, liquidaciones trimestrales, cuotas de propietarios y remesas bancarias. Siempre con justificantes claros y a tiempo.",
  },
  {
    number: "03",
    title: "Mantenimiento y conservación",
    description:
      "Supervisión de edificios, ascensores, instalaciones y zonas comunes. Disponemos de una red de proveedores contrastados y presupuestos competitivos.",
  },
  {
    number: "04",
    title: "Asesoría jurídica",
    description:
      "Defensa de los intereses de la comunidad ante reclamaciones de morosidad, conflictos vecinales y procedimientos judiciales o administrativos.",
  },
  {
    number: "05",
    title: "Seguros y responsabilidad civil",
    description:
      "Asesoramos en la contratación y renovación de pólizas para el edificio, responsabilidad civil y accidentes en zonas comunes.",
  },
  {
    number: "06",
    title: "Portal del propietario",
    description:
      "Acceso web para consultar documentación, estado de pagos, incidencias y comunicaciones de la comunidad desde cualquier dispositivo.",
  },
];

function ServiciosPage() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Header />

      <main className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        {/* Hero */}
        <section className="grid items-center gap-10 pt-10 lg:grid-cols-2 lg:pt-14">
          <div>
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              Qué hacemos por usted
            </span>
            <h1 className="mt-6 font-display text-4xl leading-[1.05] tracking-tight text-balance sm:text-5xl md:text-6xl">
              Todo lo que una comunidad necesita.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground text-pretty">
              Seis áreas de gestión para que presidentes y vecinos tengan la comunidad en orden, sin
              sorpresas ni complicaciones.
            </p>
            <div className="mt-8">
              <Link
                to="/contacto"
                className="inline-flex items-center rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-colors hover:bg-primary/90"
              >
                Solicitar información
              </Link>
            </div>
          </div>
          <div className="overflow-hidden rounded-3xl">
            <img
              src={buildingImg}
              alt="Fachada residencial española con balcones"
              width={1200}
              height={800}
              className="h-72 w-full object-cover sm:h-96"
              loading="eager"
            />
          </div>
        </section>

        {/* Services grid */}
        <section className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <GlassCard
              key={service.number}
              className="p-6 transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 font-display text-lg text-primary">
                {service.number}
              </div>
              <h3 className="mt-4 font-display text-xl text-foreground">{service.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
                {service.description}
              </p>
              {service.number === "06" ? (
                <Link
                  to="/portal"
                  className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline"
                >
                  Acceder al portal
                </Link>
              ) : null}
            </GlassCard>
          ))}
        </section>

        {/* CTA */}
        <section className="mt-16">
          <GlassCard className="relative overflow-hidden px-6 py-10 md:px-14 md:py-14">
            <div className="relative z-10 max-w-2xl">
              <h2 className="font-display text-3xl tracking-tight text-foreground text-balance sm:text-4xl">
                ¿Necesita un presupuesto a medida?
              </h2>
              <p className="mt-4 text-muted-foreground">
                Cuéntenos las características de su comunidad y le prepararemos una propuesta clara
                sin compromiso.
              </p>
              <Link
                to="/contacto"
                className="mt-6 inline-flex items-center rounded-xl bg-ink px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-ink/90"
              >
                Pedir presupuesto
              </Link>
            </div>
            <div
              className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
              aria-hidden="true"
            />
          </GlassCard>
        </section>
      </main>

      <Footer />
    </div>
  );
}
