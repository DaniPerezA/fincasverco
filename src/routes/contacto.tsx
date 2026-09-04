import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GlassCard } from "@/components/GlassCard";
import { useState } from "react";

export const Route = createFileRoute("/contacto")({
  head: () => ({
    meta: [
      { title: "Contacto — Fincas Verco" },
      { name: "description", content: "Contacta con Fincas Verco. Solicita presupuesto sin compromiso para la administración de tu comunidad de propietarios." },
      { property: "og:title", content: "Contacto — Fincas Verco" },
      { property: "og:description", content: "Solicita presupuesto sin compromiso para la administración de tu comunidad de propietarios." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactoPage,
});

function ContactoPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-frost-hero text-foreground antialiased">
      <Header />

      <main className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <section className="grid items-start gap-10 pt-10 lg:grid-cols-2 lg:pt-14">
          {/* Info */}
          <div>
            <span className="glass inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              Contacto
            </span>
            <h1 className="mt-6 font-display text-4xl leading-[1.05] tracking-tight text-balance sm:text-5xl md:text-6xl">
              Cuéntenos de su comunidad. Le llamamos hoy mismo.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground text-pretty">
              Sin compromiso. Respondemos a todas las consultas en menos de 24 horas laborables.
            </p>

            <div className="mt-8 space-y-4 text-foreground">
              <GlassCard className="flex items-center gap-4 p-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 font-display text-primary">T</div>
                <div>
                  <div className="text-sm font-semibold">Teléfono</div>
                  <div className="text-sm text-muted-foreground">91 234 56 78</div>
                </div>
              </GlassCard>
              <GlassCard className="flex items-center gap-4 p-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 font-display text-primary">@</div>
                <div>
                  <div className="text-sm font-semibold">Correo electrónico</div>
                  <div className="text-sm text-muted-foreground">hola@fincasverco.es</div>
                </div>
              </GlassCard>
              <GlassCard className="flex items-center gap-4 p-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 font-display text-primary">U</div>
                <div>
                  <div className="text-sm font-semibold">Oficinas</div>
                  <div className="text-sm text-muted-foreground">Calle del Olmo 14, 28014 Madrid</div>
                </div>
              </GlassCard>
            </div>
          </div>

          {/* Form */}
          <GlassCard className="p-6 sm:p-8">
            {submitted ? (
              <div className="py-12 text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-2xl text-primary">✓</div>
                <h2 className="mt-6 font-display text-2xl text-foreground">Mensaje enviado</h2>
                <p className="mt-2 text-muted-foreground">
                  Gracias por contactar con Fincas Verco. Le responderemos lo antes posible.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-foreground">
                    Nombre completo
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    placeholder="Su nombre"
                    className="w-full rounded-xl bg-white/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground ring-1 ring-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
                    Correo electrónico
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="su@email.com"
                    className="w-full rounded-xl bg-white/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground ring-1 ring-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label htmlFor="community" className="mb-1.5 block text-sm font-medium text-foreground">
                    Nombre de la comunidad
                  </label>
                  <input
                    id="community"
                    type="text"
                    placeholder="Comunidad de propietarios..."
                    className="w-full rounded-xl bg-white/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground ring-1 ring-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-foreground">
                    ¿En qué podemos ayudarle?
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    required
                    placeholder="Describa las necesidades de su comunidad..."
                    className="w-full resize-none rounded-xl bg-white/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground ring-1 ring-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-ink px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-ink/20 transition-colors hover:bg-ink/90"
                >
                  Enviar mensaje
                </button>
                <p className="text-center text-xs text-muted-foreground">
                  Al enviar, acepta que Fincas Verco utilice sus datos para responder a su consulta.
                </p>
              </form>
            )}
          </GlassCard>
        </section>
      </main>

      <Footer />
    </div>
  );
}
