import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        neutral: "bg-surface-muted text-ink-muted",
        accent: "bg-accent-soft text-accent",
        good: "bg-good-soft text-good",
        warn: "bg-warn-soft text-warn",
        bad: "bg-bad-soft text-bad",
        mat1: "bg-mat1-soft text-mat1",
        mat2: "bg-mat2-soft text-mat2",
        mat3: "bg-mat3-soft text-mat3",
        mat4: "bg-mat4-soft text-mat4",
      },
    },
    defaultVariants: { variant: "neutral" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
