"use server";

import { createClient } from "@/lib/supabase/server";

export async function getLaporanData(filters: any) {
  const supabase = await createClient();

  // Kita mulai query dari pengajuan_item lalu join ke pengajuan untuk dapat datanya
  // Karena laporan berfokus pada "barang yang sudah terbeli"
  let query = supabase
    .from("pengajuan_item")
    .select(`
      *,
      pengajuan!inner(*)
    `)
    .gt("jumlah_terpenuhi", 0); // HANYA barang yang sudah terpenuhi

  if (filters.mat && filters.mat.length > 0) {
    query = query.in("pengajuan.mat_kode", filters.mat);
  }

  if (filters.jenis_barang && filters.jenis_barang !== "semua") {
    query = query.eq("jenis_barang", filters.jenis_barang);
  }

  if (filters.waktu === "tanggal" && filters.tgl_awal && filters.tgl_akhir) {
    query = query
      .gte("tanggal_penerimaan", filters.tgl_awal)
      .lte("tanggal_penerimaan", filters.tgl_akhir);
  } else if (filters.waktu === "bulan" && filters.bulan && filters.tahun) {
    const start = `${filters.tahun}-${String(filters.bulan).padStart(2, "0")}-01`;
    const end = new Date(filters.tahun, filters.bulan, 0).toISOString().split('T')[0]; // last day of month
    query = query
      .gte("tanggal_penerimaan", start)
      .lte("tanggal_penerimaan", end);
  } else if (filters.waktu === "tahun" && filters.tahun) {
    const start = `${filters.tahun}-01-01`;
    const end = `${filters.tahun}-12-31`;
    query = query
      .gte("tanggal_penerimaan", start)
      .lte("tanggal_penerimaan", end);
  }

  const { data, error } = await query.order("tanggal_penerimaan", { ascending: true });

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }

  return data;
}
