"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveMasterBarang(formData: FormData) {
  const id = formData.get("id")?.toString();
  const kode_barang = formData.get("kode_barang")?.toString();
  const nama_barang = formData.get("nama_barang")?.toString();
  const satuan_default = formData.get("satuan_default")?.toString() || "Pcs";
  const jenis_barang_default = formData.get("jenis_barang_default")?.toString() || "habis_pakai";
  
  if (!kode_barang || !nama_barang) throw new Error("Kode dan Nama wajib diisi");

  const supabase = await createClient();

  if (id) {
    const { error } = await supabase.from("master_barang").update({
      kode_barang, nama_barang, satuan_default, jenis_barang_default
    }).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("master_barang").insert({
      kode_barang, nama_barang, satuan_default, jenis_barang_default
    });
    if (error) throw new Error(error.message);
  }

  revalidatePath("/master");
  return { success: true };
}

export async function toggleMasterBarang(id: string, aktif: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("master_barang").update({ aktif }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/master");
  return { success: true };
}

export async function saveMasterPekerjaan(formData: FormData) {
  const nama = formData.get("nama_pekerjaan")?.toString();
  if (!nama) throw new Error("Nama Pekerjaan wajib diisi");
  
  const supabase = await createClient();
  const { error } = await supabase.from("master_pekerjaan").insert({ nama_pekerjaan: nama });
  
  if (error) throw new Error(error.message);
  revalidatePath("/master");
  return { success: true };
}

export async function deleteMasterPekerjaan(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("master_pekerjaan").delete().eq("id", id);
  
  if (error) throw new Error(error.message);
  revalidatePath("/master");
  return { success: true };
}
