"use client";

import { useState, useTransition, useDeferredValue, useMemo } from "react";
import Link from "next/link";
import { Edit2, Trash2, Loader2, Search, FilterX, Copy, CheckSquare, ListChecks } from "lucide-react";
import { deleteTransaksi, batchUpdateMat } from "../actions";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function TableTransaksi({ data, mode }: { data: any[], mode: 'berjalan' | 'selesai' }) {
  const [isPending, startTransition] = useTransition();

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMat, setFilterMat] = useState<string>("semua");
  const [filterBulan, setFilterBulan] = useState<string>("semua");
  const [filterTahun, setFilterTahun] = useState<string>("semua");
  const [filterDefisit, setFilterDefisit] = useState<string>("semua");

  // Selection States
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const deferredQuery = useDeferredValue(searchQuery);

  const handleDelete = (id: string) => {
    if (confirm("Yakin ingin menghapus transaksi ini?")) {
      startTransition(async () => {
        try {
          await deleteTransaksi(id);
        } catch (e) {
          alert("Gagal menghapus transaksi.");
        }
      });
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setFilterMat("semua");
    setFilterBulan("semua");
    setFilterTahun("semua");
    setFilterDefisit("semua");
  };

  const handleBatchUpdate = (newMat: string) => {
    if (selectedIds.size === 0) return;
    if (confirm(`Yakin ingin memindahkan ${selectedIds.size} dokumen ke ${newMat}?`)) {
      startTransition(async () => {
        try {
          await batchUpdateMat(Array.from(selectedIds), newMat);
          setSelectedIds(new Set()); // clear selection
        } catch (e) {
          alert("Gagal memindahkan dokumen.");
        }
      });
    }
  };

  const toggleSelectAll = (filteredIds: string[]) => {
    if (selectedIds.size === filteredIds.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredIds));
    }
  };

  const toggleSelectOne = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  // Generate unique years for the filter dropdown based on data
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    data.forEach(item => {
      if (item.created_at) years.add(new Date(item.created_at).getFullYear().toString());
    });
    return Array.from(years).sort().reverse(); // Newest first
  }, [data]);

  // Apply Filters
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // 1. Search Query (Nomor Dokumen / Perihal)
      if (deferredQuery) {
        const query = deferredQuery.toLowerCase();
        const noDokumen = (item.nomor_pengajuan || "").toLowerCase();
        const perihal = (item.perihal || "").toLowerCase();
        if (!noDokumen.includes(query) && !perihal.includes(query)) {
          return false;
        }
      }

      // 2. Filter MAT
      if (filterMat !== "semua" && item.mat_kode !== filterMat) {
        return false;
      }

      // 3. Filter Date (created_at)
      if (item.created_at) {
        const date = new Date(item.created_at);
        const itemBulan = (date.getMonth() + 1).toString();
        const itemTahun = date.getFullYear().toString();

        if (filterBulan !== "semua" && itemBulan !== filterBulan) return false;
        if (filterTahun !== "semua" && itemTahun !== filterTahun) return false;
      }

      // 4. Filter Defisit
      if (filterDefisit === "defisit") {
        let isDefisit = false;
        if (item.items) {
          for (const i of item.items) {
            const d = Number(i.jumlah_diajukan) || 0;
            const t = Number(i.jumlah_terpenuhi) || 0;
            if (t < d && d > 0) {
              isDefisit = true;
              break;
            }
          }
        }
        if (!isDefisit) return false;
      }

      return true;
    });
  }, [data, deferredQuery, filterMat, filterBulan, filterTahun, filterDefisit]);

  const hasActiveFilters = searchQuery !== "" || filterMat !== "semua" || filterBulan !== "semua" || filterTahun !== "semua" || filterDefisit !== "semua";
  const allFilteredIds = filteredData.map(d => d.id);
  const isAllSelected = filteredData.length > 0 && selectedIds.size === filteredData.length;

  return (
    <div className="space-y-4">
      {/* Filters UI */}
      <div className="flex flex-col gap-3 rounded-2xl border border-surface-border/60 bg-surface p-4 shadow-sm transition-all sm:flex-row sm:items-center sm:flex-wrap">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <Input 
            type="search"
            placeholder="Cari No. Dokumen atau Perihal..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-surface/50"
          />
        </div>

        {/* Filter MAT (Only relevant if mode is 'berjalan' because 'selesai' is always MAT-004) */}
        {mode === 'berjalan' && (
          <div className="w-full sm:w-[140px]">
            <Select value={filterMat} onValueChange={setFilterMat}>
              <SelectTrigger><SelectValue placeholder="Pilih MAT" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua Fase</SelectItem>
                <SelectItem value="MAT-001">MAT-001</SelectItem>
                <SelectItem value="MAT-002">MAT-002</SelectItem>
                <SelectItem value="MAT-003">MAT-003</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Filter Bulan */}
        <div className="w-full sm:w-[140px]">
          <Select value={filterBulan} onValueChange={setFilterBulan}>
            <SelectTrigger><SelectValue placeholder="Pilih Bulan" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua Bulan</SelectItem>
              {Array.from({length: 12}).map((_, i) => (
                <SelectItem key={i+1} value={(i+1).toString()}>Bulan {i+1}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filter Tahun */}
        <div className="w-full sm:w-[120px]">
          <Select value={filterTahun} onValueChange={setFilterTahun}>
            <SelectTrigger><SelectValue placeholder="Pilih Tahun" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua Tahun</SelectItem>
              {availableYears.map(y => (
                <SelectItem key={y} value={y}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filter Defisit */}
        <div className="w-full sm:w-[160px]">
          <Select value={filterDefisit} onValueChange={setFilterDefisit}>
            <SelectTrigger><SelectValue placeholder="Status Defisit" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua Status</SelectItem>
              <SelectItem value="defisit">Ada Defisit / Kurang</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="ghost" size="icon" onClick={handleResetFilters} title="Reset Filter" className="shrink-0 text-ink-muted hover:text-bad">
            <FilterX className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="text-sm text-ink-muted">
          Menampilkan <span className="font-medium text-ink">{filteredData.length}</span> transaksi
          {selectedIds.size > 0 && <span className="ml-2 font-medium text-accent">({selectedIds.size} dipilih)</span>}
        </p>

        {/* Batch Actions */}
        {selectedIds.size > 0 && mode === 'berjalan' && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-ink-muted">Aksi Massal:</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleBatchUpdate('MAT-002')} disabled={isPending}>
                <CheckSquare className="mr-2 h-3 w-3" /> Ke MAT-002
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBatchUpdate('MAT-003')} disabled={isPending}>
                <CheckSquare className="mr-2 h-3 w-3" /> Ke MAT-003
              </Button>
              <Button size="sm" className="bg-good hover:bg-good/90 text-white" onClick={() => handleBatchUpdate('MAT-004')} disabled={isPending}>
                <ListChecks className="mr-2 h-3 w-3" /> Selesai (MAT-004)
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-surface-border bg-surface shadow-sm transition-all duration-200 hover:shadow-md">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-surface-border bg-surface-muted/50 text-ink-muted">
            <tr>
              {mode === 'berjalan' && (
                <th className="px-4 py-3 w-10">
                  <input 
                    type="checkbox" 
                    className="rounded border-surface-border"
                    checked={isAllSelected}
                    onChange={() => toggleSelectAll(allFilteredIds)}
                  />
                </th>
              )}
              <th className="px-4 py-3 font-medium">No. Dokumen</th>
              <th className="px-4 py-3 font-medium">MAT</th>
              <th className="px-4 py-3 font-medium">Perihal</th>
              <th className="px-4 py-3 font-medium">Barang / Material</th>
              <th className="px-4 py-3 font-medium">Jml Item</th>
              <th className="px-4 py-3 font-medium">Status Item</th>
              <th className="px-4 py-3 font-medium">Brg Diajukan</th>
              <th className="px-4 py-3 font-medium">Brg Terpenuhi</th>
              <th className="px-4 py-3 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={mode === 'berjalan' ? 10 : 9} className="px-4 py-8 text-center text-ink-muted">
                  {data.length === 0 ? "Belum ada data transaksi." : "Tidak ada transaksi yang cocok dengan filter."}
                </td>
              </tr>
            ) : (
              filteredData.map((row) => {
                // Calculate totals
                let tDiajukan = 0;
                let tTerpenuhi = 0;
                let sBelum = 0;
                let sSebagian = 0;
                let sPenuh = 0;

                row.items?.forEach((i: any) => {
                  const d = Number(i.jumlah_diajukan) || 0;
                  const t = Number(i.jumlah_terpenuhi) || 0;
                  
                  tDiajukan += d;
                  tTerpenuhi += t;

                  if (t === 0) sBelum++;
                  else if (t > 0 && t < d) sSebagian++;
                  else sPenuh++;
                });

                let statusItemBadge = <span className="rounded-full bg-bad/10 px-2 py-0.5 text-xs font-medium text-bad">🔴 Belum</span>;
                if (sSebagian > 0 || (sBelum > 0 && sPenuh > 0)) {
                  statusItemBadge = <span className="rounded-full bg-warn/10 px-2 py-0.5 text-xs font-medium text-warn">🟡 Sebagian</span>;
                } else if (sPenuh > 0 && sBelum === 0 && sSebagian === 0) {
                  statusItemBadge = <span className="rounded-full bg-good/10 px-2 py-0.5 text-xs font-medium text-good">🟢 Penuh</span>;
                }

                const isSelected = selectedIds.has(row.id);

                // Calculate SLA (Early Warning System)
                let diffDays = 0;
                let isOverdue = false;
                if (row.created_at && (row.mat_kode === 'MAT-001' || row.mat_kode === 'MAT-002')) {
                  const createdDate = new Date(row.created_at);
                  const now = new Date();
                  const diffTime = now.getTime() - createdDate.getTime();
                  diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                  if (diffDays >= 7) {
                    isOverdue = true;
                  }
                }

                return (
                  <tr key={row.id} className={`transition-colors ${isSelected ? 'bg-accent/5' : isOverdue ? 'bg-bad/5 hover:bg-bad/10' : 'hover:bg-surface-muted/50'}`}>
                    {mode === 'berjalan' && (
                      <td className="px-4 py-3">
                        <input 
                          type="checkbox" 
                          className="rounded border-surface-border text-accent"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(row.id)}
                        />
                      </td>
                    )}
                    <td className="px-4 py-3 font-medium">
                      <div className="flex flex-col items-start gap-1">
                        <span>{row.nomor_pengajuan}</span>
                        {isOverdue && (
                          <span className="inline-flex animate-pulse items-center gap-1 rounded-full bg-bad/20 px-2 py-0.5 text-[10px] font-bold text-bad uppercase tracking-wider shadow-sm border border-bad/20">
                            ⚠️ Terlambat ({diffDays} Hari)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-surface-muted px-2 py-1 text-xs font-medium">{row.mat_kode}</span>
                    </td>
                    <td className="px-4 py-3 max-w-[200px] truncate" title={row.perihal}>{row.perihal}</td>
                    <td className="px-4 py-3 max-w-[250px] truncate" title={row.items?.map((i: any) => i.nama_barang).join(', ')}>
                      {(() => {
                        const names = row.items?.map((i: any) => i.nama_barang).filter(Boolean) || [];
                        if (names.length === 0) return "-";
                        if (names.length <= 2) return names.join(", ");
                        return `${names[0]}, ${names[1]} (+${names.length - 2} lainnya)`;
                      })()}
                    </td>
                    <td className="px-4 py-3">{row.items?.length || 0} item</td>
                    <td className="px-4 py-3">{statusItemBadge}</td>
                    <td className="px-4 py-3">{tDiajukan} unit</td>
                    <td className="px-4 py-3 font-medium text-good">{tTerpenuhi} unit</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/form?clone=${row.id}`} title="Salin Pengajuan (Duplikasi)" className="rounded-lg p-1.5 text-ink-muted hover:bg-accent/10 hover:text-accent transition-colors hover:shadow-sm">
                          <Copy className="h-4 w-4" />
                        </Link>
                        <Link href={`/form?id=${row.id}`} title="Edit Pengajuan" className="rounded-lg p-1.5 text-ink-muted hover:bg-surface-muted hover:text-ink transition-colors hover:shadow-sm">
                          <Edit2 className="h-4 w-4" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(row.id)}
                          disabled={isPending}
                          title="Hapus Pengajuan"
                          className="rounded-lg p-1.5 text-ink-muted hover:bg-bad/10 hover:text-bad transition-colors hover:shadow-sm"
                        >
                          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
