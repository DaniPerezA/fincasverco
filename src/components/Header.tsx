import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";

export function Header() {
  return (
    <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6">
      <nav className="glass mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-4 py-3 sm:px-6 sm:py-4">
        <Link to="/" className="flex items-center gap-2.5">
          <Logo className="h-10 w-10 shrink-0 object-contain" />
          <span className="font-display text-xl tracking-tight text-foreground">Fincas Verco</span>
        </Link>

        <div className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          <Link
            to="/"
            activeProps={{ className: "text-foreground" }}
            className="transition-colors hover:text-foreground"
          >
            Inicio
          </Link>
          <Link
            to="/servicios"
            activeProps={{ className: "text-foreground" }}
            className="transition-colors hover:text-foreground"
          >
            Servicios
          </Link>
          <Link
            to="/sobre-nosotros"
            activeProps={{ className: "text-foreground" }}
            className="transition-colors hover:text-foreground"
          >
            Así trabajamos
          </Link>
          <Link
            to="/contacto"
            activeProps={{ className: "text-foreground" }}
            className="transition-colors hover:text-foreground"
          >
            Contacto
          </Link>
          <Link
            to="/portal"
            activeProps={{ className: "text-foreground" }}
            className="transition-colors hover:text-foreground"
          >
            Portal
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/portal" className="text-sm font-semibold text-primary md:hidden">
            Portal
          </Link>
          <Link
            to="/contacto"
            className="inline-flex items-center rounded-xl bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-colors hover:bg-primary/90 sm:px-4"
          >
            <span className="sm:hidden">Presupuesto</span>
            <span className="hidden sm:inline">Solicitar Presupuesto</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
