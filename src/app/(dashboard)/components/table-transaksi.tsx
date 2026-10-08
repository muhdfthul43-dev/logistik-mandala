"use client";

import { useState, useTransition, useDeferredValue, useMemo } from "react";
import Link from "next/link";
import { Edit2, Trash2, Loader2, Search, FilterX, Copy, CheckSquare, ListChecks, SplitSquareHorizontal, XCircle, AlertCircle, CheckCircle2, Filter } from "lucide-react";
import { deleteTransaksi, batchUpdateMat, splitItemsToNewMat } from "../actions";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { JENIS_BARANG_LABEL } from "@/lib/types";

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export function TableTransaksi({ data, mode }: { data: any[], mode: 'berjalan' | 'selesai' }) {
  const [isPending, startTransition] = useTransition();

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMat, setFilterMat] = useState<string>("semua");
  const [filterBulan, setFilterBulan] = useState<string>("semua");
  const [filterTahun, setFilterTahun] = useState<string>("semua");
  const [filterDefisit, setFilterDefisit] = useState<string>("semua");
  const [filterKategori, setFilterKategori] = useState<string>("semua");
  
  // UI State
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Selection States
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

  // Confirm Modal State
  const [confirmConfig, setConfirmConfig] = useState<{ isOpen: boolean; title: string; message: string; isDestructive: boolean; action: () => void }>({
    isOpen: false, title: "", message: "", isDestructive: false, action: () => {}
  });

  const deferredQuery = useDeferredValue(searchQuery);

  const handleDelete = (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: "Hapus Dokumen",
      message: "Apakah Anda yakin ingin menghapus seluruh transaksi ini secara permanen?",
      isDestructive: true,
      action: () => {
        startTransition(async () => {
          try {
            await deleteTransaksi(id);
          } catch (e) {
            alert("Gagal menghapus transaksi.");
          }
        });
      }
    });
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setFilterMat("semua");
    setFilterBulan("semua");
    setFilterTahun("semua");
    setFilterDefisit("semua");
    setFilterKategori("semua");
  };

  const handleBatchUpdate = (newMat: string) => {
    if (selectedIds.size === 0) return;
    setConfirmConfig({
      isOpen: true,
      title: "Pindah Dokumen (Batch)",
      message: `Anda akan memindahkan ${selectedIds.size} dokumen sekaligus ke fase ${newMat}. Lanjutkan?`,
      isDestructive: false,
      action: () => {
        startTransition(async () => {
          try {
            await batchUpdateMat(Array.from(selectedIds), newMat);
            setSelectedIds(new Set());
          } catch (e) {
            alert("Gagal memindahkan dokumen.");
          }
        });
      }
    });
  };

  const handleSplitItems = (newMat: string) => {
    if (selectedItemIds.size === 0) return;
    setConfirmConfig({
      isOpen: true,
      title: "Pecah Barang (Split)",
      message: `Anda akan memisahkan ${selectedItemIds.size} barang ini dan memindahkannya ke fase ${newMat}. Lanjutkan?`,
      isDestructive: false,
      action: () => {
        startTransition(async () => {
          try {
            await splitItemsToNewMat(Array.from(selectedItemIds), newMat);
            setSelectedItemIds(new Set());
          } catch (e: any) {
            alert("Gagal memecah barang: " + e.message);
          }
        });
      }
    });
  };

  const toggleSelectAllDocs = (filteredIds: string[]) => {
    if (selectedIds.size === filteredIds.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredIds));
    }
  };

  const toggleSelectOneDoc = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleSelectOneItem = (itemId: string) => {
    const newSet = new Set(selectedItemIds);
    if (newSet.has(itemId)) newSet.delete(itemId);
    else newSet.add(itemId);
    setSelectedItemIds(newSet);
  };

  const availableYears = useMemo(() => {
    const years = new Set<string>();
    data.forEach(item => {
      if (item.items) {
        item.items.forEach((i: any) => {
          if (i.tanggal_pengajuan) {
            years.add(new Date(i.tanggal_pengajuan).getFullYear().toString());
          }
        });
      }
    });
    return Array.from(years).sort().reverse();
  }, [data]);

  const filteredData = useMemo(() => {
    const result: any[] = [];
    
    data.forEach(doc => {
      if (filterMat !== "semua" && doc.mat_kode !== filterMat) {
        return; 
      }

      const matchedDoc = { ...doc };
      let matchedItems = doc.items ? [...doc.items] : [];

      // A. Search
      if (deferredQuery) {
        const query = deferredQuery.toLowerCase();
        const noDokumen = (doc.nomor_pengajuan || "").toLowerCase();
        const perihal = (doc.perihal || "").toLowerCase();
        const docMatches = noDokumen.includes(query) || perihal.includes(query);
        
        if (!docMatches) {
          matchedItems = matchedItems.filter((i: any) => (i.nama_barang || "").toLowerCase().includes(query));
        }
      }

      // B. Filter Kategori Barang
      if (filterKategori !== "semua") {
        matchedItems = matchedItems.filter((i: any) => i.jenis_barang === filterKategori);
      }

      // C. Filter Bulan & Tahun Pengajuan
      if (filterBulan !== "semua" || filterTahun !== "semua") {
        matchedItems = matchedItems.filter((i: any) => {
          if (!i.tanggal_pengajuan) return false;
          const d = new Date(i.tanggal_pengajuan);
          const y = d.getFullYear().toString();
          const m = (d.getMonth() + 1).toString();
          
          let keep = true;
          if (filterBulan !== "semua" && m !== filterBulan) keep = false;
          if (filterTahun !== "semua" && y !== filterTahun) keep = false;
          return keep;
        });
      }

      // D. Filter Status Defisit
      if (filterDefisit === "defisit") {
        matchedItems = matchedItems.filter((i: any) => {
          const diajukan = Number(i.jumlah_diajukan) || 0;
          const terpenuhi = Number(i.jumlah_terpenuhi) || 0;
          return terpenuhi < diajukan && diajukan > 0;
        });
      }

      const hasItemFilters = filterBulan !== "semua" || filterTahun !== "semua" || filterDefisit !== "semua" || filterKategori !== "semua";
      if (hasItemFilters && matchedItems.length === 0) {
        return;
      }
      
      if (deferredQuery && matchedItems.length === 0 && !((doc.nomor_pengajuan || "").toLowerCase().includes(deferredQuery.toLowerCase()) || (doc.perihal || "").toLowerCase().includes(deferredQuery.toLowerCase()))) {
         return;
      }

      matchedDoc.items = matchedItems;
      result.push(matchedDoc);
    });
    
    return result;
  }, [data, deferredQuery, filterMat, filterBulan, filterTahun, filterDefisit, filterKategori]);

  const hasActiveFilters = searchQuery !== "" || filterMat !== "semua" || filterBulan !== "semua" || filterTahun !== "semua" || filterDefisit !== "semua" || filterKategori !== "semua";
  const allFilteredIds = filteredData.map(d => d.id);
  const isAllSelectedDocs = filteredData.length > 0 && selectedIds.size === filteredData.length;

  return (
    <div className="space-y-4 relative">
      <ConfirmModal 
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        isDestructive={confirmConfig.isDestructive}
        onConfirm={confirmConfig.action}
        onCancel={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
      />

      {/* Modern Filter Section */}
      <div className="flex flex-col gap-3 rounded-2xl border border-surface-border/60 bg-surface p-4 shadow-sm transition-all">
        
        {/* Main Search Row */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <Input 
              type="search"
              placeholder="Cari No. Dokumen, Perihal, atau Nama Barang..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-surface/50 w-full"
            />
          </div>
          <Button 
            variant={showAdvancedFilters ? "default" : "outline"}
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="shrink-0 flex items-center gap-2 transition-colors"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filter Data</span>
            {(filterMat !== 'semua' || filterBulan !== 'semua' || filterTahun !== 'semua' || filterDefisit !== 'semua' || filterKategori !== 'semua') && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[10px] text-surface font-bold">!</span>
            )}
          </Button>
        </div>

        {/* Collapsible Advanced Filters Row */}
        {showAdvancedFilters && (
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-surface-border/40 animate-in slide-in-from-top-2 fade-in duration-200">
            {mode === 'berjalan' && (
              <div className="w-[140px]">
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

            <div className="w-[160px]">
              <Select value={filterKategori} onValueChange={setFilterKategori}>
                <SelectTrigger><SelectValue placeholder="Kategori Aset" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua Kategori</SelectItem>
                  {Object.entries(JENIS_BARANG_LABEL).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-[140px]">
              <Select value={filterBulan} onValueChange={setFilterBulan}>
                <SelectTrigger><SelectValue placeholder="Pilih Bulan" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua Bulan</SelectItem>
                  {MONTH_NAMES.map((monthName, i) => (
                    <SelectItem key={i+1} value={(i+1).toString()}>{monthName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-[120px]">
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

            <div className="w-[160px]">
              <Select value={filterDefisit} onValueChange={setFilterDefisit}>
                <SelectTrigger><SelectValue placeholder="Status Defisit" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua Status</SelectItem>
                  <SelectItem value="defisit">Ada Defisit / Kurang</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={handleResetFilters} className="text-ink-muted hover:text-bad ml-auto">
                <FilterX className="mr-2 h-4 w-4" /> Reset
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="text-sm text-ink-muted">
          Menampilkan <span className="font-medium text-ink">{filteredData.length}</span> transaksi
          {selectedIds.size > 0 && <span className="ml-2 font-medium text-accent">({selectedIds.size} dokumen dipilih)</span>}
          {selectedItemIds.size > 0 && <span className="ml-2 font-medium text-warn">({selectedItemIds.size} barang dipilih)</span>}
        </p>

        {/* Batch Actions (Document Level) */}
        {selectedIds.size > 0 && selectedItemIds.size === 0 && mode === 'berjalan' && (
          <div className="flex items-center gap-2 animate-in fade-in zoom-in">
            <span className="text-xs font-medium text-ink-muted">Pindah Dokumen:</span>
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

        {/* Batch Actions (Item Level - SPLIT) */}
        {selectedItemIds.size > 0 && mode === 'berjalan' && (
          <div className="flex items-center gap-2 animate-in fade-in zoom-in rounded-lg bg-warn/10 p-1.5 border border-warn/20">
            <span className="text-xs font-medium text-warn ml-2">Pecah Barang (Split):</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="border-warn/30 hover:bg-warn/20 text-warn" onClick={() => handleSplitItems('MAT-002')} disabled={isPending}>
                <SplitSquareHorizontal className="mr-2 h-3 w-3" /> Ke MAT-002
              </Button>
              <Button size="sm" variant="outline" className="border-warn/30 hover:bg-warn/20 text-warn" onClick={() => handleSplitItems('MAT-003')} disabled={isPending}>
                <SplitSquareHorizontal className="mr-2 h-3 w-3" /> Ke MAT-003
              </Button>
              <Button size="sm" className="bg-good hover:bg-good/90 text-white shadow-sm" onClick={() => handleSplitItems('MAT-004')} disabled={isPending}>
                <ListChecks className="mr-2 h-3 w-3" /> Selesai (MAT-004)
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-surface-border bg-surface shadow-sm transition-all duration-200 hover:shadow-md relative z-10">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-surface-border bg-surface-muted/50 text-ink-muted">
            <tr>
              {mode === 'berjalan' && (
                <th className="px-4 py-3 w-10">
                  <input 
                    type="checkbox" 
                    className="rounded border-surface-border"
                    checked={isAllSelectedDocs}
                    onChange={() => toggleSelectAllDocs(allFilteredIds)}
                    title="Pilih Semua Dokumen"
                  />
                </th>
              )}
              <th className="px-4 py-3 font-medium">No. Dokumen</th>
              <th className="px-4 py-3 font-medium">MAT</th>
              <th className="px-4 py-3 font-medium w-[150px]">Perihal</th>
              {mode === 'berjalan' && (
                <th className="px-2 py-3 w-8" title="Centang untuk memecah barang">
                  <SplitSquareHorizontal className="h-4 w-4 text-ink-muted" />
                </th>
              )}
              <th className="px-4 py-3 font-medium">Barang / Material</th>
              <th className="px-4 py-3 font-medium">Status Item</th>
              <th className="px-4 py-3 font-medium">Diajukan</th>
              <th className="px-4 py-3 font-medium">Terpenuhi</th>
              <th className="px-4 py-3 font-medium text-right">Aksi Dokumen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={mode === 'berjalan' ? 10 : 8} className="px-4 py-8 text-center text-ink-muted">
                  {data.length === 0 ? "Belum ada data transaksi." : "Tidak ada transaksi yang cocok dengan filter."}
                </td>
              </tr>
            ) : (
              filteredData.flatMap((row) => {
                const isSelectedDoc = selectedIds.has(row.id);
                const items = row.items || [];
                const rowCount = Math.max(1, items.length);
                
                let diffDays = 0;
                let isOverdue = false;
                if (row.created_at && (row.mat_kode === 'MAT-001' || row.mat_kode === 'MAT-002')) {
                  const diffTime = new Date().getTime() - new Date(row.created_at).getTime();
                  diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                  if (diffDays >= 7) isOverdue = true;
                }

                const docRowClasses = isSelectedDoc ? 'bg-accent/5' : isOverdue ? 'bg-bad/5' : '';

                const renderDocColumns = () => (
                  <>
                    {mode === 'berjalan' && (
                      <td className="px-4 py-3 border-r border-surface-border/50 align-top" rowSpan={rowCount}>
                        <input 
                          type="checkbox" 
                          className="rounded border-surface-border text-accent mt-1"
                          checked={isSelectedDoc}
                          onChange={() => toggleSelectOneDoc(row.id)}
                          title="Pilih Dokumen Ini"
                        />
                      </td>
                    )}
                    <td className="px-4 py-3 font-medium border-r border-surface-border/50 align-top" rowSpan={rowCount}>
                      <div className="flex flex-col items-start gap-1">
                        <span>{row.nomor_pengajuan}</span>
                        {isOverdue && (
                          <span className="inline-flex animate-pulse items-center gap-1 rounded-full bg-bad/20 px-2 py-0.5 text-[10px] font-bold text-bad uppercase tracking-wider shadow-sm border border-bad/20">
                            ?? Terlambat ({diffDays} Hari)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 border-r border-surface-border/50 align-top" rowSpan={rowCount}>
                      <span className="rounded-md bg-surface-muted px-2 py-1 text-xs font-medium">{row.mat_kode}</span>
                    </td>
                    <td className="px-4 py-3 truncate whitespace-normal border-r border-surface-border/50 align-top" title={row.perihal} rowSpan={rowCount}>
                      {row.perihal}
                    </td>
                  </>
                );

                const renderAksiColumn = () => (
                  <td className="px-4 py-3 border-l border-surface-border/50 align-top" rowSpan={rowCount}>
                    <div className="flex flex-col sm:flex-row items-center justify-end gap-2">
                      <Link href={`/form?clone=${row.id}`} title="Salin Dokumen" className="rounded-lg p-1.5 text-ink-muted hover:bg-accent/10 hover:text-accent transition-colors hover:shadow-sm">
                        <Copy className="h-4 w-4" />
                      </Link>
                      <Link href={`/form?id=${row.id}`} title="Edit Dokumen" className="rounded-lg p-1.5 text-ink-muted hover:bg-surface-muted hover:text-ink transition-colors hover:shadow-sm">
                        <Edit2 className="h-4 w-4" />
                      </Link>
                      <button 
                        onClick={() => handleDelete(row.id)}
                        disabled={isPending}
                        title="Hapus Dokumen"
                        className="rounded-lg p-1.5 text-ink-muted hover:bg-bad/10 hover:text-bad transition-colors hover:shadow-sm"
                      >
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                );

                if (items.length === 0) {
                  return [
                    <tr key={row.id} className={`border-b-2 border-surface-border/80 ${docRowClasses} hover:bg-surface-muted/30`}>
                      {renderDocColumns()}
                      {mode === 'berjalan' && <td></td>}
                      <td className="px-4 py-3 text-ink-muted italic" colSpan={4}>Belum ada barang</td>
                      {renderAksiColumn()}
                    </tr>
                  ];
                }

                return items.map((item: any, idx: number) => {
                  const isSelectedItem = selectedItemIds.has(item.id);
                  const d = Number(item.jumlah_diajukan) || 0;
                  const t = Number(item.jumlah_terpenuhi) || 0;
                  
                  let statusItemBadge = <span className="inline-flex items-center gap-1 rounded-full bg-bad/10 px-2 py-0.5 text-xs font-medium text-bad"><XCircle className="h-3 w-3"/> Belum</span>;
                  if (t > 0 && t < d) statusItemBadge = <span className="inline-flex items-center gap-1 rounded-full bg-warn/10 px-2 py-0.5 text-xs font-medium text-warn"><AlertCircle className="h-3 w-3"/> Sebagian</span>;
                  else if (t >= d && d > 0) statusItemBadge = <span className="inline-flex items-center gap-1 rounded-full bg-good/10 px-2 py-0.5 text-xs font-medium text-good"><CheckCircle2 className="h-3 w-3"/> Penuh</span>;

                  const isLastRow = idx === items.length - 1;
                  
                  let rowClass = `${docRowClasses} hover:bg-surface-muted/30 ${isLastRow ? 'border-b-2 border-surface-border/80' : ''}`;
                  if (isSelectedItem) {
                    rowClass = `bg-warn/10 hover:bg-warn/20 ${isLastRow ? 'border-b-2 border-warn/30' : ''}`;
                  }
                  
                  const kategoriLabel = item.jenis_barang === 'habis_pakai' ? 'HABIS PAKAI' : 'ASET TETAP';

                  return (
                    <tr key={`${row.id}-${idx}`} className={rowClass}>
                      {idx === 0 && renderDocColumns()}
                      
                      {mode === 'berjalan' && (
                        <td className="px-2 py-3 border-r border-surface-border/30">
                          <input 
                            type="checkbox" 
                            className="rounded border-warn/50 text-warn"
                            checked={isSelectedItem}
                            onChange={() => toggleSelectOneItem(item.id)}
                            title="Centang untuk Pindah MAT / Pecah Dokumen"
                          />
                        </td>
                      )}
                      
                      <td className="px-4 py-3 whitespace-normal min-w-[200px]">
                        <div className="font-medium text-ink">{item.nama_barang}</div>
                        <div className="flex items-center gap-2 mt-1">
                          {item.ukuran_volume && <span className="text-xs text-ink-muted">({item.ukuran_volume})</span>}
                          <span className="text-[10px] bg-surface-muted/80 border border-surface-border px-1.5 py-0.5 rounded text-ink-muted uppercase font-bold tracking-wider">
                            {kategoriLabel}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">{statusItemBadge}</td>
                      <td className="px-4 py-3">{d} <span className="text-xs text-ink-muted">{item.satuan}</span></td>
                      <td className="px-4 py-3 font-medium text-good">{t} <span className="text-xs text-ink-muted">{item.satuan}</span></td>
                      {idx === 0 && renderAksiColumn()}
                    </tr>
                  );
                });
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
