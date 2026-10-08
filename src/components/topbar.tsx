"use client";

import { Menu } from "lucide-react";
import { Logo } from "@/components/logo";

export function Topbar({ onOpenMenu, title }: { onOpenMenu: () => void; title?: string }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-surface/95 px-4 backdrop-blur lg:px-8">
      <button
        onClick={onOpenMenu}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-ink hover:bg-surface-muted lg:hidden"
        aria-label="Buka menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="lg:hidden">
        <Logo size={28} />
      </div>
      {title && <h1 className="hidden font-display text-lg font-semibold text-ink lg:block">{title}</h1>}
    </header>
  );
}
