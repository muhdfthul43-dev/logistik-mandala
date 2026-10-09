"use client";

import { useState, useEffect } from "react";
import { X, Calendar, CheckCircle, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PenerimaanModalProps {
  isOpen: boolean;
  items: any[];
  onConfirm: (completionData: any[]) => void;
  onCancel: () => void;
  isPending?: boolean;
}

export function PenerimaanModal({ isOpen, items, onConfirm, onCancel, isPending }: PenerimaanModalProps) {
  const [formData, setFormData] = useState<any[]>([]);
  const [globalDate, setGlobalDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (isOpen) {
      setFormData(items.map(item => ({
        id: item.id,
        nama_barang: item.nama_barang,
        jumlah_diajukan: item.jumlah_diajukan,
        satuan: item.satuan,
        jumlah_terpenuhi: item.jumlah_terpenuhi || item.jumlah_diajukan,
        tanggal_penerimaan: item.tanggal_penerimaan || new Date().toISOString().split('T')[0],
        keterangan: item.keterangan || ""
      })));
    }
  }, [isOpen, items]);

  if (!isOpen) return null;

  const handleGlobalDateChange = (val: string) => {
    setGlobalDate(val);
    setFormData(prev => prev.map(p => ({ ...p, tanggal_penerimaan: val })));
  };

  const updateItem = (id: string, field: string, val: any) => {
    setFormData(prev => prev.map(p => p.id === id ? { ...p, [field]: val } : p));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-ink/20 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl rounded-2xl bg-surface shadow-xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-border p-6">
          <div className="flex items-center gap-3 text-good">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-good/10">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink">Penerimaan Barang (MAT-004)</h2>
              <p className="text-xs text-ink-muted">Tentukan jumlah yang berhasil dipenuhi dan tanggal penerimaannya.</p>
            </div>
          </div>
          <button onClick={onCancel} className="rounded-full p-2 text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Global Control */}
        <div className="border-b border-surface-border bg-surface-muted/30 p-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-sm font-medium">
            Total <span className="text-good">{items.length}</span> barang akan diselesaikan
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-ink-muted whitespace-nowrap">Set Semua Tanggal:</Label>
            <Input 
              type="date" 
              value={globalDate} 
              onChange={(e) => handleGlobalDateChange(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
        </div>

        {/* Content / Items List */}
        <div className="overflow-y-auto p-6 space-y-4 flex-1">
          {formData.map((item, idx) => {
            const isPartial = Number(item.jumlah_terpenuhi) < Number(item.jumlah_diajukan);
            return (
              <div key={item.id} className={`p-4 rounded-xl border transition-colors ${isPartial ? 'border-warn/50 bg-warn/5' : 'border-surface-border bg-surface'}`}>
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                  
                  {/* Item Info */}
                  <div className="flex-1 flex items-start gap-3">
                    <div className="mt-1 bg-surface-muted p-2 rounded-lg">
                      <Package className="h-4 w-4 text-ink-muted" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-ink">{item.nama_barang}</h4>
                      <div className="text-xs text-ink-muted mt-0.5">
                        Diajukan: <span className="font-semibold text-ink">{item.jumlah_diajukan} {item.satuan}</span>
                      </div>
                    </div>
                  </div>

                  {/* Inputs */}
                  <div className="w-full md:w-auto grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Jml Terpenuhi</Label>
                      <Input 
                        type="number" 
                        min="0"
                        value={item.jumlah_terpenuhi} 
                        onChange={(e) => updateItem(item.id, 'jumlah_terpenuhi', e.target.value)}
                        className={`h-8 ${isPartial ? 'border-warn focus-visible:ring-warn' : ''}`}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Tgl Penerimaan</Label>
                      <Input 
                        type="date" 
                        value={item.tanggal_penerimaan} 
                        onChange={(e) => updateItem(item.id, 'tanggal_penerimaan', e.target.value)}
                        className="h-8"
                      />
                    </div>
                    <div className="space-y-1 col-span-2 md:col-span-1">
                      <Label className="text-xs">Catatan</Label>
                      <Input 
                        value={item.keterangan} 
                        onChange={(e) => updateItem(item.id, 'keterangan', e.target.value)}
                        placeholder={isPartial ? "Alasan parsial..." : "Opsional"}
                        className="h-8"
                      />
                    </div>
                  </div>

                </div>
                {isPartial && (
                  <p className="mt-3 text-[11px] text-warn font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-warn"></span>
                    Perhatian: Jumlah terpenuhi kurang dari yang diajukan. Sisa barang akan dianggap batal jika diselesaikan.
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-surface-border p-6 flex justify-end gap-3 bg-surface-muted/10 rounded-b-2xl">
          <Button variant="outline" onClick={onCancel} disabled={isPending}>Batal</Button>
          <Button className="bg-good hover:bg-good/90 text-white" onClick={() => onConfirm(formData)} disabled={isPending}>
            {isPending ? "Menyimpan..." : "Simpan & Pindah ke MAT-004"}
          </Button>
        </div>
      </div>
    </div>
  );
}
