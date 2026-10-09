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
    
    // get latest sequence for this month to avoid unique constraint errors if a document was deleted
    const { data: latestDoc } = await supabase
      .from("pengajuan")
      .select("nomor_pengajuan")
      .like("nomor_pengajuan", `${prefix}%`)
      .order("nomor_pengajuan", { ascending: false })
      .limit(1)
      .maybeSingle();
      
    let seqNumber = 1;
    if (latestDoc && latestDoc.nomor_pengajuan) {
      const parts = latestDoc.nomor_pengajuan.split('/');
      if (parts.length === 4) {
        const numStr = parts[3].split('-')[0]; // gets '004' from '004-A'
        seqNumber = parseInt(numStr, 10) + 1;
      }
    }
    
    const seq = String(seqNumber).padStart(3, "0");
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

  // Auto-register manual items to Master Barang
  if (items && items.length > 0) {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      // Jika belum terhubung ke Master Data
      if (!item.master_barang_id) {
         let newKode = item.kode_barang_manual;
         
         if (newKode) {
            // Check if this manual code already exists in master (happens if user edits an existing linked item's name)
            const { data: existing } = await supabase.from("master_barang").select("id").eq("kode_barang", newKode).maybeSingle();
            if (existing) {
               newKode = `AUTO-${Math.floor(Math.random() * 90000) + 10000}`;
            }
         } else {
            newKode = `AUTO-${Math.floor(Math.random() * 90000) + 10000}`;
         }
         
         // Coba masukkan ke master_barang
         const { data: newMaster, error: masterErr } = await supabase
           .from("master_barang")
           .insert({
              kode_barang: newKode,
              nama_barang: item.nama_barang,
              satuan_default: item.satuan || 'Pcs',
              jenis_barang_default: item.jenis_barang || 'habis_pakai',
              status: 'aktif'
           })
           .select()
           .single();
           
         if (!masterErr && newMaster) {
            // Sukses didaftarkan ke Master, ubah item ini jadi terhubung!
            item.master_barang_id = newMaster.id;
            item.kode_barang_manual = null;
         }
      }
    }
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
  revalidatePath("/master");
  
  return { success: true, id: pengajuanId };
}
