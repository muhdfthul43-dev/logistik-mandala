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
  PackageOpen,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Profile } from "@/lib/types";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/berjalan", label: "Sedang Berjalan", icon: ClipboardList },
  { href: "/selesai", label: "Selesai (MAT-004)", icon: CheckCircle },
  { href: "/master", label: "Master Barang", icon: Database },
  { href: "/laporan", label: "Laporan & Cetak", icon: FileBarChart },
] as const;

export function Sidebar({
  profile,
  mobileOpen = false,
  onCloseMobile,
}: {
  profile: Profile;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-200 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
      <div className="flex h-16 items-center border-b border-white/10 px-5">
        <Logo textClassName="text-sidebar-foreground [&>p:last-child]:text-sidebar-muted" />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent text-white"
                    : "text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground"
                )}
              >
                <Icon className="h-4.5 w-4.5" />
                {item.label}
              </Link>
            );
          }
        )}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="mb-2 rounded-lg bg-sidebar-hover px-3 py-2.5">
          <p className="truncate text-sm font-medium text-sidebar-foreground">{profile.full_name}</p>
          <p className="text-xs text-sidebar-muted">Administrator</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-muted transition-colors hover:bg-sidebar-hover hover:text-sidebar-foreground"
        >
          <LogOut className="h-4.5 w-4.5" />
          Keluar
        </button>
      </div>
      </aside>
    </>
  );
}
