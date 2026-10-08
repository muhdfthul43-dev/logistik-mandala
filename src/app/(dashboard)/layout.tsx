import { requireUserOrRedirect } from "@/lib/permissions";
import { AppShell } from "@/components/app-shell";

export default async function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireUserOrRedirect();

  return <AppShell profile={profile}>{children}</AppShell>;
}
