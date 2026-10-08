// Tipe data yang mencerminkan skema Sistem Logistik Mandala (Single Admin)

export type JenisBarang = "habis_pakai" | "aset_tetap";
export type MatKode = "MAT-001" | "MAT-002" | "MAT-003" | "MAT-004";

export interface Profile {
  id: string;
  full_name: string;
  created_at: string;
}

export interface MasterBarang {
  id: string;
  kode_barang: string;
  nama_barang: string;
  satuan_default: string;
  jenis_barang_default: JenisBarang;
  aktif: boolean;
  created_at: string;
}

export interface Pengajuan {
  id: string;
  nomor_pengajuan: string;
  mat_kode: MatKode;
  perihal: string;
  catatan: string | null;
  created_at: string;
  updated_at: string;
  items?: PengajuanItem[];
}

export interface PengajuanItem {
  id: string;
  pengajuan_id: string;
  master_barang_id: string | null;
  kode_barang_manual: string | null;
  jenis_pekerjaan: string | null;
  nama_barang: string;
  merk: string | null;
  ukuran_volume: string | null;
  satuan: string;
  jenis_barang: JenisBarang;
  jumlah_diajukan: number;
  jumlah_terpenuhi: number | null;
  tanggal_pengajuan: string | null;
  tanggal_penerimaan: string | null;
  keterangan: string | null;
  created_at: string;
  master_barang?: MasterBarang | null;
}

// ---------- LABEL & METADATA UNTUK UI ----------

export const JENIS_BARANG_LABEL: Record<JenisBarang, string> = {
  habis_pakai: "Habis Pakai",
  aset_tetap: "Aset Tetap",
};

export const MAT_KODE_LABEL: Record<MatKode, string> = {
  "MAT-001": "MAT-001",
  "MAT-002": "MAT-002",
  "MAT-003": "MAT-003",
  "MAT-004": "MAT-004",
};

export const SATUAN_UMUM = [
  "Pcs",
  "Unit",
  "Box",
  "Rim",
  "Lusin",
  "Set",
  "Paket",
  "Botol",
  "Kg",
  "Liter",
  "Dus",
  "Kotak"
] as const;
