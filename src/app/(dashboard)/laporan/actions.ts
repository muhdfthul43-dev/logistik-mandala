"use server";

import { createClient } from "@/lib/supabase/server";

export async function getLaporanData(filters: any) {
  const supabase = await createClient();

  let query = supabase
    .from("pengajuan_item")
    .select(`
      *,
      pengajuan!inner(*)
    `);

  // Filter MAT
  if (filters.mat && filters.mat.length > 0) {
    query = query.in("pengajuan.mat_kode", filters.mat);
  }

  // Filter Jenis Barang
  if (filters.jenis_barang && filters.jenis_barang !== "semua") {
    query = query.eq("jenis_barang", filters.jenis_barang);
  }

  // Filter Jenis Pekerjaan
  if (filters.jenis_pekerjaan && filters.jenis_pekerjaan !== "semua") {
    query = query.eq("jenis_pekerjaan", filters.jenis_pekerjaan);
  }

  // Filter Pencarian Text
  // Note: Dihapus dari Supabase OR karena PostgREST tidak mendukung OR melintasi tabel relasi (pengajuan.*).
  // Akan difilter di JS.

  // Filter Waktu (Berdasarkan tanggal_pengajuan atau tanggal_penerimaan)
  // Untuk laporan komprehensif, biasanya menggunakan tanggal_pengajuan
  if (filters.waktu === "tanggal" && filters.tgl_awal && filters.tgl_akhir) {
    query = query.gte("tanggal_pengajuan", filters.tgl_awal).lte("tanggal_pengajuan", filters.tgl_akhir);
  } else if (filters.waktu === "bulan" && filters.bulan && filters.tahun) {
    const start = `${filters.tahun}-${String(filters.bulan).padStart(2, "0")}-01`;
    const end = new Date(filters.tahun, filters.bulan, 0).toISOString().split('T')[0];
    query = query.gte("tanggal_pengajuan", start).lte("tanggal_pengajuan", end);
  } else if (filters.waktu === "tahun" && filters.tahun) {
    const start = `${filters.tahun}-01-01`;
    const end = `${filters.tahun}-12-31`;
    query = query.gte("tanggal_pengajuan", start).lte("tanggal_pengajuan", end);
  }

  const { data, error } = await query.order("tanggal_pengajuan", { ascending: true });

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }

  let resultData = data || [];

  // JS Memory Filters
  if (filters.search && filters.search.trim() !== "") {
    const s = filters.search.toLowerCase();
    resultData = resultData.filter(item => {
      const nama = item.nama_barang?.toLowerCase() || "";
      const no = item.pengajuan?.nomor_pengajuan?.toLowerCase() || "";
      const perihal = item.pengajuan?.perihal?.toLowerCase() || "";
      return nama.includes(s) || no.includes(s) || perihal.includes(s);
    });
  }

  if (filters.status_pemenuhan && filters.status_pemenuhan !== "semua") {
    resultData = resultData.filter(item => {
      const d = Number(item.jumlah_diajukan) || 0;
      const t = Number(item.jumlah_terpenuhi) || 0;
      if (filters.status_pemenuhan === "penuh") return t >= d && d > 0;
      if (filters.status_pemenuhan === "sebagian") return t > 0 && t < d;
      if (filters.status_pemenuhan === "belum") return t === 0;
      return true;
    });
  }

  return resultData;
}
