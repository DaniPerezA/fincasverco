import type { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export function SiteFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-frost-hero text-foreground antialiased">
      <Header />
      <main className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">{children}</main>
      <Footer />
    </div>
  );
}
