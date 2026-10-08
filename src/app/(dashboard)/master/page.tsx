import { createClient } from "@/lib/supabase/server";
import { MasterClient } from "./master-client";

export default async function MasterBarangPage() {
  const supabase = await createClient();

  const [resBarang, resPekerjaan] = await Promise.all([
    supabase.from("master_barang").select("*").order("kode_barang", { ascending: true }),
    supabase.from("master_pekerjaan").select("*").order("nama_pekerjaan", { ascending: true })
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Kamus Data</h1>
        <p className="text-sm text-ink-muted">
          Kelola master data barang dan jenis pekerjaan untuk autofill form transaksi.
        </p>
      </div>

      <MasterClient dataBarang={resBarang.data || []} dataPekerjaan={resPekerjaan.data || []} />
    </div>
  );
}
