import { createClient } from "@/lib/supabase/server";
import { TableTransaksi } from "../components/table-transaksi";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function BerjalanPage() {
  const supabase = await createClient();

  const { data: pengajuan, error } = await supabase
    .from("pengajuan")
    .select(`
      *,
      items:pengajuan_item(*)
    `)
    .neq("mat_kode", "MAT-004")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Gagal memuat data", error);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Sedang Berjalan</h1>
          <p className="text-sm text-ink-muted">
            Semua transaksi pada tahap MAT-001, MAT-002, dan MAT-003.
          </p>
        </div>
        <Button asChild>
          <Link href="/form">
            <Plus className="mr-2 h-4 w-4" />
            Transaksi Baru
          </Link>
        </Button>
      </div>

      <TableTransaksi data={pengajuan || []} mode="berjalan" />
    </div>
  );
}
