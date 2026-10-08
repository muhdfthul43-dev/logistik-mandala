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

export async function batchUpdateMat(ids: string[], newMatKode: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("pengajuan")
    .update({ mat_kode: newMatKode })
    .in("id", ids);
    
  if (error) throw new Error(error.message);
  
  revalidatePath("/berjalan");
  revalidatePath("/selesai");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function splitItemsToNewMat(itemIds: string[], targetMat: string) {
  if (!itemIds || itemIds.length === 0) return { success: false, message: "Tidak ada barang yang dipilih" };

  const supabase = await createClient();
  
  // 1. Get the first item to find its parent document
  const { data: items, error: itemsErr } = await supabase
    .from("pengajuan_item")
    .select("*, pengajuan(*)")
    .in("id", itemIds);

  if (itemsErr || !items || items.length === 0) throw new Error("Gagal mengambil data barang");

  // Group items by their original pengajuan_id just in case they selected items from multiple docs
  const groupedByPengajuan = items.reduce((acc, item) => {
    const pId = item.pengajuan_id;
    if (!acc[pId]) {
      acc[pId] = {
        pengajuan: item.pengajuan,
        itemsToMove: []
      };
    }
    acc[pId].itemsToMove.push(item);
    return acc;
  }, {} as Record<string, any>);

  for (const [oldPengajuanId, group] of Object.entries<any>(groupedByPengajuan)) {
    const parentDoc = group.pengajuan;
    
    // Create new Document keeping the exact same nomor_pengajuan
    const { data: newDoc, error: insertErr } = await supabase.from("pengajuan").insert({
      nomor_pengajuan: parentDoc.nomor_pengajuan,
      mat_kode: targetMat,
      perihal: parentDoc.perihal,
      catatan: parentDoc.catatan
    }).select().single();

    if (insertErr) throw new Error("Gagal membuat dokumen pecahan: " + insertErr.message);

    // Update the selected items to point to the new Document
    const idsToMove = group.itemsToMove.map((i: any) => i.id);
    const { error: updateErr } = await supabase
      .from("pengajuan_item")
      .update({ pengajuan_id: newDoc.id })
      .in("id", idsToMove);

    if (updateErr) throw new Error("Gagal memindahkan barang: " + updateErr.message);
  }

  revalidatePath("/berjalan");
  revalidatePath("/selesai");
  revalidatePath("/dashboard");
  return { success: true };
}
