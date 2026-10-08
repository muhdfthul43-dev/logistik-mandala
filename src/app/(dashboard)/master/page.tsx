import { createClient } from "@/lib/supabase/server";
import { MasterClient } from "./master-client";

export default async function MasterBarangPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("master_barang")
    .select("*")
    .order("kode_barang", { ascending: true });

  if (error) {
    console.error("Gagal memuat master barang", error);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Master Barang</h1>
        <p className="text-sm text-ink-muted">
          Kelola katalog barang untuk autofill di form transaksi.
        </p>
      </div>

      <MasterClient data={data || []} />
    </div>
  );
}
