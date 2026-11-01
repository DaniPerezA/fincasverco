import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-ink text-primary-foreground">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-8 border-b border-white/10 pb-10 md:flex-row md:items-center md:justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <Logo className="h-10 w-10 shrink-0 object-contain" />
            <span className="font-display text-lg font-medium text-primary-foreground">
              Fincas Verco
            </span>
          </Link>
          <nav className="flex flex-wrap gap-6 text-sm font-medium text-white/70">
            <Link to="/" className="transition-colors hover:text-primary-foreground">
              Inicio
            </Link>
            <Link to="/servicios" className="transition-colors hover:text-primary-foreground">
              Servicios
            </Link>
            <Link to="/sobre-nosotros" className="transition-colors hover:text-primary-foreground">
              Así trabajamos
            </Link>
            <Link to="/contacto" className="transition-colors hover:text-primary-foreground">
              Contacto
            </Link>
            <Link to="/portal" className="transition-colors hover:text-primary-foreground">
              Portal
            </Link>
          </nav>
        </div>
        <div className="mt-8 flex flex-col gap-2 text-xs text-white/55 md:flex-row md:items-center md:justify-between">
          <span>
            © {new Date().getFullYear()} Fincas Verco · Administradora de Comunidades de
            Propietarios
          </span>
          <span>Calle del Azahar 7, 28020 Madrid · 91 579 55 46</span>
        </div>
      </div>
    </footer>
  );
}
