"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveTransaksi(formData: any) {
  const supabase = await createClient();
  const { id, mat_kode, perihal, catatan, items } = formData;
  
  let pengajuanId = id;

  if (!pengajuanId) {
    // Insert new
    // generate nomor pengajuan
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, "0");
    const prefix = `PKB/${year}/${month}/`;
    
    // get count for this month
    const { count } = await supabase
      .from("pengajuan")
      .select("*", { count: "exact", head: true })
      .like("nomor_pengajuan", `${prefix}%`);
      
    const seq = String((count || 0) + 1).padStart(3, "0");
    const nomor_pengajuan = `${prefix}${seq}`;

    const { data: header, error: headerErr } = await supabase
      .from("pengajuan")
      .insert({
        nomor_pengajuan,
        mat_kode,
        perihal,
        catatan,
      })
      .select()
      .single();

    if (headerErr) throw new Error(headerErr.message);
    pengajuanId = header.id;
  } else {
    // Update existing
    const { error: updateErr } = await supabase
      .from("pengajuan")
      .update({
        mat_kode,
        perihal,
        catatan,
      })
      .eq("id", pengajuanId);
      
    if (updateErr) throw new Error(updateErr.message);
    
    // Delete old items to replace with new ones
    await supabase.from("pengajuan_item").delete().eq("pengajuan_id", pengajuanId);
  }

  // Insert items
  if (items && items.length > 0) {
    const itemsToInsert = items.map((item: any) => ({
      pengajuan_id: pengajuanId,
      master_barang_id: item.master_barang_id || null,
      kode_barang_manual: item.kode_barang_manual || null,
      jenis_pekerjaan: item.jenis_pekerjaan || null,
      nama_barang: item.nama_barang,
      merk: item.merk || null,
      ukuran_volume: item.ukuran_volume || null,
      satuan: item.satuan,
      jenis_barang: item.jenis_barang,
      jumlah_diajukan: Number(item.jumlah_diajukan) || 0,
      jumlah_terpenuhi: Number(item.jumlah_terpenuhi) || 0,
      tanggal_pengajuan: item.tanggal_pengajuan || null,
      tanggal_penerimaan: item.tanggal_penerimaan || null,
      keterangan: item.keterangan || null,
    }));
    
    const { error: itemsErr } = await supabase.from("pengajuan_item").insert(itemsToInsert);
    if (itemsErr) throw new Error(itemsErr.message);
  }

  revalidatePath("/berjalan");
  revalidatePath("/selesai");
  revalidatePath("/dashboard");
  
  return { success: true, id: pengajuanId };
}
