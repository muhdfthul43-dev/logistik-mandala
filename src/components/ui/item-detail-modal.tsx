"use client";

import { X, Package, FileText, Calendar, Tag, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { JENIS_BARANG_LABEL } from "@/lib/types";

interface ItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any | null;
  document: any | null;
}

export function ItemDetailModal({ isOpen, onClose, item, document }: ItemDetailModalProps) {
  if (!isOpen || !item || !document) return null;

  const diajukan = Number(item.jumlah_diajukan) || 0;
  const terpenuhi = Number(item.jumlah_terpenuhi) || 0;
  
  let statusColor = "bg-surface-muted text-ink-muted border-surface-border";
  let StatusIcon = Clock;
  let statusText = "Belum Terpenuhi";

  if (terpenuhi >= diajukan && diajukan > 0) {
    statusColor = "bg-good/10 text-good border-good/20";
    StatusIcon = CheckCircle2;
    statusText = "Terpenuhi Penuh";
  } else if (terpenuhi > 0 && terpenuhi < diajukan) {
    statusColor = "bg-warn/10 text-warn border-warn/20";
    StatusIcon = AlertCircle;
    statusText = "Terpenuhi Sebagian";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-ink/20 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="w-full max-w-2xl rounded-2xl bg-surface shadow-xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-surface-border p-6 bg-surface-muted/30">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-ink text-surface shadow-sm">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-ink">{item.nama_barang}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusColor}`}>
                  <StatusIcon className="h-3.5 w-3.5" />
                  {statusText}
                </span>
                <span className="inline-flex rounded-full bg-surface border border-surface-border px-2.5 py-0.5 text-xs font-medium text-ink-muted shadow-sm">
                  {item.jenis_barang === 'aset_tetap' ? 'Aset Tetap' : 'Habis Pakai'}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1 bg-surface">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Kuantitas & Pemenuhan */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-ink-muted" /> Status Logistik
              </h3>
              <div className="rounded-xl border border-surface-border bg-surface-muted/20 p-4 space-y-3">
                <div className="flex justify-between items-center border-b border-surface-border/50 pb-2">
                  <span className="text-xs text-ink-muted">Diajukan</span>
                  <span className="text-sm font-bold">{diajukan} {item.satuan}</span>
                </div>
                <div className="flex justify-between items-center border-b border-surface-border/50 pb-2">
                  <span className="text-xs text-ink-muted">Terpenuhi</span>
                  <span className={`text-sm font-bold ${terpenuhi >= diajukan ? 'text-good' : terpenuhi > 0 ? 'text-warn' : 'text-bad'}`}>
                    {terpenuhi} {item.satuan}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-ink-muted">Tgl Penerimaan</span>
                  <span className="text-sm font-medium">{item.tanggal_penerimaan ? new Date(item.tanggal_penerimaan).toLocaleDateString('id-ID') : '-'}</span>
                </div>
              </div>
            </div>

            {/* Identitas Dokumen */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                <FileText className="h-4 w-4 text-ink-muted" /> Identitas Dokumen
              </h3>
              <div className="rounded-xl border border-surface-border bg-surface-muted/20 p-4 space-y-3">
                <div className="flex justify-between items-center border-b border-surface-border/50 pb-2">
                  <span className="text-xs text-ink-muted">No. Pengajuan</span>
                  <span className="text-sm font-semibold">{document.nomor_pengajuan}</span>
                </div>
                <div className="flex justify-between items-center border-b border-surface-border/50 pb-2">
                  <span className="text-xs text-ink-muted">Fase MAT</span>
                  <span className="text-sm font-semibold bg-surface px-2 py-0.5 rounded shadow-sm border border-surface-border">{document.mat_kode}</span>
                </div>
                <div className="flex justify-between items-center border-b border-surface-border/50 pb-2">
                  <span className="text-xs text-ink-muted">Tgl Pengajuan</span>
                  <span className="text-sm font-medium">{item.tanggal_pengajuan ? new Date(item.tanggal_pengajuan).toLocaleDateString('id-ID') : '-'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-ink-muted">Jenis Pekerjaan</span>
                  <span className="text-sm font-medium">{item.jenis_pekerjaan || '-'}</span>
                </div>
              </div>
            </div>

            {/* Spesifikasi Barang */}
            <div className="space-y-3 md:col-span-2">
              <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                <Tag className="h-4 w-4 text-ink-muted" /> Spesifikasi & Catatan
              </h3>
              <div className="rounded-xl border border-surface-border bg-surface-muted/20 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-ink-muted block">Merk Barang</span>
                  <span className="text-sm font-medium block">{item.merk || '-'}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-ink-muted block">Ukuran / Volume / Dimensi</span>
                  <span className="text-sm font-medium block">{item.ukuran_volume || '-'}</span>
                </div>
                <div className="space-y-1 md:col-span-2 mt-2 pt-3 border-t border-surface-border/50">
                  <span className="text-xs text-ink-muted block mb-1">Catatan Item Tambahan</span>
                  <p className="text-sm text-ink bg-surface p-3 rounded-lg border border-surface-border min-h-[60px] italic">
                    {item.keterangan || "Tidak ada catatan."}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
