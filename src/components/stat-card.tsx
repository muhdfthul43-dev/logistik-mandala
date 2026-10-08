import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "neutral",
  hint,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "neutral" | "accent" | "warn" | "good" | "bad";
  hint?: string;
}) {
  const toneClasses: Record<typeof tone, string> = {
    neutral: "bg-surface-muted text-ink-muted",
    accent: "bg-accent-soft text-accent",
    warn: "bg-warn-soft text-warn",
    good: "bg-good-soft text-good",
    bad: "bg-bad-soft text-bad",
  };

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between group">
        <div>
          <p className="text-sm font-medium text-ink-muted">{label}</p>
          <p className="mt-1 font-display text-2xl font-bold text-ink tracking-tight">{value}</p>
          {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
        </div>
        <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 shadow-sm", toneClasses[tone])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}
