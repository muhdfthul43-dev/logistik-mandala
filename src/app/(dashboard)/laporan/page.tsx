import { LaporanClient } from "./laporan-client";
import { createClient } from "@/lib/supabase/server";

export default async function LaporanPage() {
  const supabase = await createClient();
  const { data: masterPekerjaan } = await supabase.from("master_pekerjaan").select("*").order("nama_pekerjaan");

  return (
    <div className="space-y-6 print:space-y-0">
      <div className="print:hidden">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Laporan & Cetak PDF</h1>
        <p className="text-sm text-ink-muted">
          Saring data dan cetak dokumen resmi untuk laporan pengadaan barang.
        </p>
      </div>

      <LaporanClient masterPekerjaan={masterPekerjaan || []} />
    </div>
  );
}
