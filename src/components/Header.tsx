import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";

export function Header() {
  return (
    <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6">
      <nav className="glass mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-4 py-3 sm:px-6 sm:py-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-lg font-semibold text-primary-foreground font-display">
            V
          </div>
          <span className="font-display text-xl tracking-tight text-foreground">Fincas Verco</span>
        </Link>

        <div className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          <Link to="/" activeProps={{ className: "text-foreground" }} className="transition-colors hover:text-foreground">
            Inicio
          </Link>
          <Link to="/servicios" activeProps={{ className: "text-foreground" }} className="transition-colors hover:text-foreground">
            Servicios
          </Link>
          <Link to="/sobre-nosotros" activeProps={{ className: "text-foreground" }} className="transition-colors hover:text-foreground">
            Sobre nosotros
          </Link>
          <Link to="/contacto" activeProps={{ className: "text-foreground" }} className="transition-colors hover:text-foreground">
            Contacto
          </Link>
        </div>

        <Link
          to="/contacto"
          className="inline-flex items-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-colors hover:bg-primary/90"
        >
          Solicitar cuota
        </Link>
      </nav>
    </header>
  );
}
