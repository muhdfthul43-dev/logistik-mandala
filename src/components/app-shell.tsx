"use client";

import { TopNav } from "@/components/topnav";
import type { Profile } from "@/lib/types";

export function AppShell({ profile, children }: { profile: Profile; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg">
      <TopNav profile={profile} />
      <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
