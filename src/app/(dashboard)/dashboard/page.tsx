import { ClipboardList, PackageOpen, Activity, CheckCircle2, AlertTriangle, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireUserOrRedirect } from "@/lib/permissions";
import { StatCard } from "@/components/stat-card";
import { MaterialBarChart, PipelineDonutChart } from "./dashboard-charts";
import { Card } from "@/components/ui/card";

export default async function DashboardPage() {
  const profile = await requireUserOrRedirect();
  const supabase = await createClient();

  // 1. Fetch All Pengajuan for Activities, Pipeline, and Alerts
  const { data: allPengajuan } = await supabase
    .from("pengajuan")
    .select("id, nomor_pengajuan, perihal, mat_kode, created_at")
    .order("created_at", { ascending: false });

  const pengajuanList = allPengajuan || [];
  
  const totalRecord = pengajuanList.length;
  const sedangBerjalan = pengajuanList.filter(p => p.mat_kode !== "MAT-004").length;
  const selesai = pengajuanList.filter(p => p.mat_kode === "MAT-004").length;

  // Recent 5 activities
  const recentActivities = pengajuanList.slice(0, 5);

  // SLA Alerts (Overdue > 7 days in MAT-001 or MAT-002)
  const now = new Date();
  const overdueList = pengajuanList.filter(p => {
    if (p.mat_kode !== "MAT-001" && p.mat_kode !== "MAT-002") return false;
    if (!p.created_at) return false;
    const diffTime = now.getTime() - new Date(p.created_at).getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    // Store diff in obj for display
    (p as any).diffDays = diffDays;
    return diffDays >= 7;
  }).slice(0, 5);

  // Pipeline Data
  const countMat = { "MAT-001": 0, "MAT-002": 0, "MAT-003": 0, "MAT-004": 0 };
  pengajuanList.forEach(p => {
    if (countMat[p.mat_kode as keyof typeof countMat] !== undefined) {
      countMat[p.mat_kode as keyof typeof countMat]++;
    }
  });

  const pipelineData = [
    { name: "MAT-001 (Pengajuan)", value: countMat["MAT-001"], color: "#8a94a6" },
    { name: "MAT-002 (Proses PO)", value: countMat["MAT-002"], color: "#e8b031" },
    { name: "MAT-003 (Pengiriman)", value: countMat["MAT-003"], color: "#228be6" },
    { name: "MAT-004 (Selesai)", value: countMat["MAT-004"], color: "#0b7285" },
  ];

  // 2. Fetch Items for Stok Parsial & Bar Chart
  const { data: allItemsRaw } = await supabase
    .from("pengajuan_item")
    .select("jenis_pekerjaan, jumlah_diajukan, jumlah_terpenuhi");

  let stokParsialCount = 0;
  const categoryMap: Record<string, { diajukan: number, terpenuhi: number }> = {};
  
  if (allItemsRaw) {
    allItemsRaw.forEach((item: any) => {
      const d = Number(item.jumlah_diajukan) || 0;
      const t = Number(item.jumlah_terpenuhi) || 0;
      
      if (t > 0 && t < d) {
        stokParsialCount++;
      }

      const jb = item.jenis_pekerjaan || "Umum";
      if (!categoryMap[jb]) categoryMap[jb] = { diajukan: 0, terpenuhi: 0 };
      categoryMap[jb].diajukan += d;
      categoryMap[jb].terpenuhi += t;
    });
  }

  const chartData = Object.keys(categoryMap).map(k => ({
    name: k,
    diajukan: categoryMap[k].diajukan,
    terpenuhi: categoryMap[k].terpenuhi
  }));

  // Helper
  const formatDate = (ds: string) => {
    return new Date(ds).toLocaleDateString("id-ID", { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">
          Halo, {profile.full_name?.split(" ")[0] || "Admin"} 👋
        </h1>
        <p className="text-sm text-ink-muted">Berikut ringkasan data logistik konstruksi saat ini.</p>
      </div>

      {/* SLA Alerts Panel */}
      {overdueList.length > 0 && (
        <div className="rounded-2xl border border-bad/20 bg-bad/5 p-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-bad"></div>
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="h-5 w-5 text-bad" />
            <h3 className="font-semibold text-bad">Peringatan Mendesak! ({overdueList.length} Dokumen Terlambat)</h3>
          </div>
          <div className="flex flex-col gap-2">
            {overdueList.map(p => (
              <div key={p.id} className="flex items-center justify-between rounded-lg bg-surface/50 p-2 text-sm border border-bad/10">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-ink">{p.nomor_pengajuan}</span>
                  <span className="truncate text-ink-muted hidden sm:inline-block max-w-[200px]">{p.perihal}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-bad/10 px-2 py-0.5 text-xs font-bold text-bad">
                    Telat {(p as any).diffDays} Hari
                  </span>
                  <Link href={`/form?id=${p.id}`} className="text-accent hover:underline flex items-center gap-1 text-xs font-medium">
                    Cek <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Dokumen" value={`${totalRecord} record`} icon={ClipboardList} tone="neutral" />
        <StatCard label="Sedang Berjalan" value={`${sedangBerjalan} record`} icon={Activity} tone="warn" />
        <StatCard label="Selesai (MAT-004)" value={`${selesai} record`} icon={CheckCircle2} tone="good" />
        <StatCard label="Material Defisit" value={`${stokParsialCount} item`} icon={PackageOpen} tone="bad" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <PipelineDonutChart data={pipelineData} />
        </div>
        <div className="lg:col-span-2">
          <MaterialBarChart data={chartData} />
        </div>
      </div>

      {/* Recent Activities */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold text-ink">Aktivitas Logistik Terkini</h3>
            <p className="text-sm text-ink-muted">5 dokumen terakhir yang dibuat ke dalam sistem.</p>
          </div>
          <Clock className="h-5 w-5 text-ink-muted" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-surface-border text-ink-muted">
              <tr>
                <th className="py-2 font-medium">No. Dokumen</th>
                <th className="py-2 font-medium">Tanggal</th>
                <th className="py-2 font-medium">Fase MAT</th>
                <th className="py-2 font-medium">Perihal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {recentActivities.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-ink-muted">Belum ada aktivitas.</td>
                </tr>
              ) : (
                recentActivities.map(p => (
                  <tr key={p.id} className="hover:bg-surface-muted/30">
                    <td className="py-3 font-medium">
                      <Link href={`/form?id=${p.id}`} className="hover:text-accent transition-colors">{p.nomor_pengajuan}</Link>
                    </td>
                    <td className="py-3 text-ink-muted">{p.created_at ? formatDate(p.created_at) : "-"}</td>
                    <td className="py-3">
                      <span className="rounded-md bg-surface-muted px-2 py-1 text-xs font-medium">{p.mat_kode}</span>
                    </td>
                    <td className="py-3 max-w-[200px] truncate" title={p.perihal || ""}>{p.perihal}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
