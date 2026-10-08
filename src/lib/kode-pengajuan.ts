import "server-only";
import { createClient } from "@/lib/supabase/server";

/**
 * Bikin nomor pengajuan berurut per tahun, mis. "PGJ-2026-0001",
 * "PGJ-2026-0002", dst. Polanya sengaja disamakan dengan generator kode
 * barang di SIMBA (KATEGORI-TAHUN-NNNN) supaya konsisten.
 */
export async function generateNomorPengajuan(): Promise<string> {
  const supabase = await createClient();
  const tahun = new Date().getFullYear();
  const prefix = `PGJ-${tahun}-`;

  const { count } = await supabase
    .from("pengajuan")
    .select("id", { count: "exact", head: true })
    .like("nomor_pengajuan", `${prefix}%`);

  const nomorUrut = (count ?? 0) + 1;
  return `${prefix}${String(nomorUrut).padStart(4, "0")}`;
}
