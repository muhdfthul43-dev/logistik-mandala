import { AlertTriangle, Info } from "lucide-react";
import { Button } from "./button";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

export function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, isDestructive = false }: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div className="bg-surface border border-surface-border w-full max-w-md rounded-2xl p-6 shadow-xl animate-in zoom-in-95 duration-200 slide-in-from-bottom-4">
        <div className="flex gap-4">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isDestructive ? 'bg-bad/10 text-bad' : 'bg-accent/10 text-accent'}`}>
            {isDestructive ? <AlertTriangle className="h-5 w-5" /> : <Info className="h-5 w-5" />}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-ink leading-none mt-2">{title}</h3>
            <p className="mt-3 text-sm text-ink-muted leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="mt-8 flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel} className="font-medium">
            Batal
          </Button>
          <Button 
            className={`font-medium ${isDestructive ? 'bg-bad hover:bg-bad/90 text-white border-transparent' : 'bg-ink hover:bg-ink/90 text-surface border-transparent'}`}
            onClick={() => {
              onConfirm();
              onCancel();
            }}
          >
            Ya, Lanjutkan
          </Button>
        </div>
      </div>
    </div>
  );
}
