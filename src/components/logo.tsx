import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({
  size = 36,
  showText = true,
  textClassName,
}: {
  size?: number;
  showText?: boolean;
  textClassName?: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Image
        src="/logo-sttm.png"
        alt="Logo STT Mandala"
        width={size}
        height={size}
        className="shrink-0"
        priority
      />
      {showText && (
        <div className={cn("leading-tight", textClassName)}>
          <p className="font-display text-sm font-semibold">Sistem Logistik</p>
          <p className="text-[11px] text-ink-muted">STT Mandala</p>
        </div>
      )}
    </div>
  );
}
