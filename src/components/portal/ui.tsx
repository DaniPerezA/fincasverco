import type { ReactNode } from "react";

export const fieldClass =
  "w-full rounded-xl bg-white/70 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground ring-1 ring-border focus:outline-none focus:ring-2 focus:ring-primary/50";

export const primaryButtonClass =
  "inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60";

export const quietButtonClass =
  "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-foreground ring-1 ring-border transition-colors hover:bg-white/60 disabled:cursor-not-allowed disabled:opacity-60";

export function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

export function FormNote({ tone, children }: { tone: "error" | "ok"; children: ReactNode }) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={tone === "error" ? "text-sm text-red-700" : "text-sm text-emerald-800"}
    >
      {children}
    </p>
  );
}
