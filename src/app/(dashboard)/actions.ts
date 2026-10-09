"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteTransaksi(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("pengajuan").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/berjalan");
  revalidatePath("/selesai");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function batchUpdateMat(ids: string[], newMatKode: string, completionData?: any[]) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("pengajuan")
    .update({ mat_kode: newMatKode })
    .in("id", ids);
    
  if (error) throw new Error(error.message);
  
  if (completionData && completionData.length > 0) {
    for (const data of completionData) {
      await supabase.from("pengajuan_item").update({
        tanggal_penerimaan: data.tanggal_penerimaan,
        jumlah_terpenuhi: Number(data.jumlah_terpenuhi) || 0,
        keterangan: data.keterangan || null
      }).eq('id', data.id);
    }
  }

  revalidatePath("/berjalan");
  revalidatePath("/selesai");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function splitItemsToNewMat(itemIds: string[], targetMat: string, completionData?: any[]) {
  if (!itemIds || itemIds.length === 0) return { success: false, message: "Tidak ada barang yang dipilih" };

  const supabase = await createClient();
  
  const { data: items, error: itemsErr } = await supabase
    .from("pengajuan_item")
    .select("*, pengajuan(*)")
    .in("id", itemIds);

  if (itemsErr || !items || items.length === 0) throw new Error("Gagal mengambil data barang");

  const groupedByPengajuan = items.reduce((acc, item) => {
    const pId = item.pengajuan_id;
    if (!acc[pId]) {
      acc[pId] = { pengajuan: item.pengajuan, itemsToMove: [] };
    }
    acc[pId].itemsToMove.push(item);
    return acc;
  }, {} as Record<string, any>);

  for (const [oldPengajuanId, group] of Object.entries<any>(groupedByPengajuan)) {
    const parentDoc = group.pengajuan;
    
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, "0");
    const prefix = `PKB/${year}/${month}/`;
    
    // Gunakan pencarian ID terbesar, BUKAN count() untuk menghindari bentrok saat ada yang dihapus
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
        const numStr = parts[3].split('-')[0];
        seqNumber = parseInt(numStr, 10) + 1;
      }
    }
      
    const randomChar = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const seq = String(seqNumber).padStart(3, "0");
    const newNomorPengajuan = `${prefix}${seq}-${randomChar}`;

    const { data: newDoc, error: insertErr } = await supabase.from("pengajuan").insert({
      nomor_pengajuan: newNomorPengajuan,
      mat_kode: targetMat,
      perihal: parentDoc.perihal,
      catatan: parentDoc.catatan
    }).select().single();

    if (insertErr) throw new Error("Gagal membuat dokumen pecahan: " + insertErr.message);

    for (const item of group.itemsToMove) {
      const updates: any = { pengajuan_id: newDoc.id };
      
      // If completionData exists, find the data for this item
      if (completionData) {
        const cData = completionData.find((c: any) => c.id === item.id);
        if (cData) {
          updates.tanggal_penerimaan = cData.tanggal_penerimaan;
          updates.jumlah_terpenuhi = Number(cData.jumlah_terpenuhi) || 0;
          updates.keterangan = cData.keterangan || null;
        }
      }
      
      const { error: updateErr } = await supabase.from("pengajuan_item").update(updates).eq('id', item.id);
      if (updateErr) throw new Error("Gagal memindahkan barang: " + updateErr.message);
    }

    // CLEANUP: Periksa apakah dokumen lama sudah kosong (semua barangnya dipindah)
    const { count: remainingItems } = await supabase
      .from("pengajuan_item")
      .select("*", { count: "exact", head: true })
      .eq("pengajuan_id", oldPengajuanId);

    if (remainingItems === 0) {
      // Hapus dokumen lama jika sudah kosong
      await supabase.from("pengajuan").delete().eq("id", oldPengajuanId);
    }
  }

  revalidatePath("/berjalan");
  revalidatePath("/selesai");
  revalidatePath("/dashboard");
  return { success: true };
}
