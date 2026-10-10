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
  X,
  ChevronLeft,
  ChevronRight
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

export function Sidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <>
      {/* Mobile Top Header */}
      <header className="lg:hidden sticky top-0 z-50 w-full border-b border-surface-border bg-surface/80 backdrop-blur-md print:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={24} />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-ink hover:bg-surface-muted rounded-md transition-colors"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        
        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="absolute top-16 left-0 w-full border-b border-surface-border bg-surface shadow-xl animate-in slide-in-from-top-2 z-40">
            <nav className="p-4 flex flex-col gap-2">
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-all",
                      active
                        ? "bg-accent text-accent-foreground shadow-md shadow-accent/20"
                        : "text-ink-muted hover:bg-surface-muted hover:text-ink"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
              <div className="mt-4 pt-4 border-t border-surface-border">
                <div className="px-4 mb-4">
                  <p className="text-sm font-bold text-ink">{profile.full_name}</p>
                  <p className="text-xs font-medium text-ink-muted">Administrator</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-bad hover:bg-bad/10 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  Keluar
                </button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "hidden lg:flex flex-col h-screen sticky top-0 border-r border-surface-border bg-surface/50 backdrop-blur-xl print:hidden shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-40 transition-all duration-300 ease-in-out relative",
          isCollapsed ? "w-[80px]" : "w-[280px]"
        )}
      >
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3.5 top-8 z-50 flex h-7 w-7 items-center justify-center rounded-full border border-surface-border bg-white text-ink shadow-sm hover:bg-surface-muted hover:scale-110 transition-all"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>

        <div className={cn("p-6 flex items-center border-b border-surface-border/50 h-[88px]", isCollapsed ? "justify-center px-0" : "gap-3")}>
          <Logo size={28} />
          {!isCollapsed && (
            <div className="flex flex-col animate-in fade-in duration-300">
              <span className="font-black tracking-tight text-ink leading-none mt-1">LOGISTIK</span>
              <span className="text-[10px] font-bold tracking-widest text-ink-muted uppercase">STT Mandala</span>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-2 scrollbar-none px-3">
          {!isCollapsed && (
            <div className="px-3 mb-2 animate-in fade-in duration-300">
              <p className="text-xs font-bold tracking-widest text-ink-muted/70 uppercase">Menu Utama</p>
            </div>
          )}
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  "flex items-center rounded-xl py-3 text-sm font-semibold transition-all group relative overflow-hidden",
                  isCollapsed ? "justify-center px-0 mx-auto w-12 h-12" : "gap-3 px-4",
                  active
                    ? "bg-accent text-accent-foreground shadow-lg shadow-accent/20"
                    : "text-ink-muted hover:bg-surface-muted hover:text-ink"
                )}
              >
                {active && !isCollapsed && <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />}
                <Icon className={cn("h-5 w-5 transition-transform group-hover:scale-110 shrink-0", active ? "text-accent-foreground" : "text-ink-muted group-hover:text-ink")} />
                {!isCollapsed && <span className="animate-in fade-in duration-300 truncate">{item.label}</span>}
              </Link>
            );
          })}
        </div>

        <div className={cn("m-3 rounded-2xl bg-surface-muted/50 border border-surface-border backdrop-blur-md transition-all duration-300", isCollapsed ? "p-2 flex flex-col gap-2" : "p-4")}>
          {!isCollapsed ? (
            <>
              <div className="flex items-center gap-3 mb-4 animate-in fade-in duration-300">
                <div className="h-10 w-10 shrink-0 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold border border-accent/20 shadow-sm">
                  {profile.full_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-ink truncate">{profile.full_name}</p>
                  <p className="text-[11px] font-medium tracking-wide text-ink-muted uppercase">Administrator</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-white border border-surface-border px-4 py-2 text-sm font-bold text-bad hover:bg-bad hover:text-white hover:border-bad transition-all shadow-sm hover:shadow-md"
              >
                <LogOut className="h-4 w-4" />
                Keluar
              </button>
            </>
          ) : (
            <>
              <div className="h-10 w-10 mx-auto shrink-0 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold border border-accent/20 shadow-sm" title={profile.full_name}>
                {profile.full_name.charAt(0)}
              </div>
              <button
                onClick={handleLogout}
                title="Keluar"
                className="flex w-10 h-10 mx-auto items-center justify-center rounded-xl bg-white border border-surface-border text-bad hover:bg-bad hover:text-white hover:border-bad transition-all shadow-sm hover:shadow-md"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
