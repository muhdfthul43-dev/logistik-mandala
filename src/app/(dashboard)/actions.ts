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
