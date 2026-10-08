"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  FileBarChart,
  Database,
  LogOut,
  CheckCircle,
  Menu,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Profile } from "@/lib/types";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/berjalan", label: "Sedang Berjalan", icon: ClipboardList },
  { href: "/selesai", label: "Selesai (MAT-004)", icon: CheckCircle },
  { href: "/master", label: "Master Barang", icon: Database },
  { href: "/laporan", label: "Laporan", icon: FileBarChart },
] as const;

export function TopNav({ profile }: { profile: Profile }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-surface-border bg-surface/95">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <Logo size={28} />
            </Link>
            
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-accent/10 text-accent"
                        : "text-ink-muted hover:bg-surface-muted hover:text-ink"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-ink leading-tight">{profile.full_name}</p>
                <p className="text-xs text-ink-muted">Admin</p>
              </div>
              <div className="h-8 w-px bg-surface-border" />
              <button
                onClick={handleLogout}
                title="Keluar"
                className="flex items-center justify-center rounded-md p-2 text-ink-muted hover:bg-bad/10 hover:text-bad transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="flex lg:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md p-2 text-ink hover:bg-surface-muted focus:outline-none"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="sr-only">Buka main menu</span>
                <Menu className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu, show/hide based on menu state. */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-surface-border bg-surface px-2 pb-3 pt-2">
            <div className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium transition-colors",
                      active
                        ? "bg-accent/10 text-accent"
                        : "text-ink-muted hover:bg-surface-muted hover:text-ink"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
            <div className="mt-4 border-t border-surface-border pt-4 pb-1">
              <div className="flex items-center px-3 mb-3">
                <div className="ml-3">
                  <div className="text-base font-medium text-ink">{profile.full_name}</div>
                  <div className="text-sm font-medium text-ink-muted">Administrator</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-base font-medium text-bad hover:bg-bad/10 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                Keluar
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
