import { LaporanClient } from "./laporan-client";

export default function LaporanPage() {
  return (
    <div className="space-y-6 print:space-y-0">
      <div className="print:hidden">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Laporan & Cetak PDF</h1>
        <p className="text-sm text-ink-muted">
          Saring data dan cetak dokumen resmi untuk laporan pengadaan barang.
        </p>
      </div>

      <LaporanClient />
    </div>
  );
}
