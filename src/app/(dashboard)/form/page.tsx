import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FormTransaksi } from "./form-transaksi";

export default async function FormPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string, clone?: string }>;
}) {
  const { id, clone } = await searchParams;
  const supabase = await createClient();

  // Load master barang untuk autofill
  const [resBarang, resPekerjaan] = await Promise.all([supabase.from("master_barang").select("*").eq("aktif", true).order("kode_barang", { ascending: true }), supabase.from("master_pekerjaan").select("*").order("nama_pekerjaan", { ascending: true })]); const masterBarang = resBarang.data;

  let initialData = null;

  if (id || clone) {
    const targetId = id || clone;
    const { data: pengajuan, error } = await supabase
      .from("pengajuan")
      .select(`
        *,
        items:pengajuan_item(*)
      `)
      .eq("id", targetId)
      .single();

    if (error || !pengajuan) {
      redirect("/dashboard");
    }
    
    initialData = pengajuan;

    // Jika ini adalah mode clone, buang ID dan set menjadi dokumen baru
    if (clone) {
      initialData = {
        ...initialData,
        id: undefined,
        nomor_pengajuan: undefined,
        created_at: undefined,
        mat_kode: 'MAT-001', // Reset kembali ke tahap awal
        items: initialData.items.map((item: any) => ({
          ...item,
          id: undefined,
          pengajuan_id: undefined,
          jumlah_terpenuhi: 0, // Reset jumlah terpenuhi
          tanggal_penerimaan: null,
          keterangan: null,
        }))
      };
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          {id ? "Edit Transaksi" : clone ? "Duplikasi Transaksi" : "Transaksi Baru"}
        </h1>
        <p className="text-sm text-ink-muted">
          {id ? `Mengedit dokumen ${initialData?.nomor_pengajuan}` : clone ? `Menyalin dari dokumen lama` : "Buat dokumen pengajuan baru."}
        </p>
      </div>

      <FormTransaksi 
        initialData={initialData} 
        masterBarang={masterBarang || []} masterPekerjaan={resPekerjaan.data || []} 
      />
    </div>
  );
}

