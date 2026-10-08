import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Endpoint ringan buat "membangunkan" project Supabase gratis (auto-pause
 * kalau tidak ada aktivitas ~7 hari). Panggil rutin lewat cron eksternal
 * gratis, mis. cron-job.org, tiap beberapa hari sekali — lihat README.
 */
export async function GET() {
  const supabase = await createClient();
  await supabase.from("kategori_barang").select("id").limit(1);
  return NextResponse.json({ ok: true, ts: new Date().toISOString() });
}
