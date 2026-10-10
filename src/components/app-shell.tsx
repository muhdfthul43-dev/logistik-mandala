"use client";

import { Sidebar } from "@/components/sidebar";
import type { Profile } from "@/lib/types";

export function AppShell({ profile, children }: { profile: Profile; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-bg print:bg-white text-ink selection:bg-accent/20">
      <Sidebar profile={profile} />
      
      {/* Fluid width container, expanding to take remaining space */}
      <main className="flex-1 w-full min-w-0 max-w-[1920px] mx-auto p-4 sm:p-6 lg:p-8 xl:p-10 print:p-0 print:max-w-none print:mx-0">
        <div className="mx-auto w-full max-w-[1600px] animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
