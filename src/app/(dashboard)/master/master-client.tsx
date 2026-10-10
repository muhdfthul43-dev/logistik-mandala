"use client";

import { useState, useTransition, useMemo } from "react";
import { Edit2, Ban, CheckCircle, Plus, Shuffle, Loader2, Box, LayoutGrid, Search, CheckCircle2, XCircle } from "lucide-react";
import { saveMasterBarang, toggleMasterBarang } from "./actions";
import { MasterPekerjaanClient } from "./master-pekerjaan-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { JENIS_BARANG_LABEL, SATUAN_UMUM } from "@/lib/types";

export function MasterClient({ dataBarang, dataPekerjaan }: { dataBarang: any[], dataPekerjaan: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [isPekerjaanModalOpen, setIsPekerjaanModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    kode_barang: "",
    nama_barang: "",
    satuan_default: "Pcs",
    jenis_barang_default: "habis_pakai",
    jenis_pekerjaan: "Umum",
  });

  const [confirmConfig, setConfirmConfig] = useState<{ isOpen: boolean; title: string; message: string; isDestructive: boolean; action: () => void }>({
    isOpen: false, title: "", message: "", isDestructive: false, action: () => {}
  });

  const filteredData = useMemo(() => {
    if (!searchQuery) return dataBarang;
    const lower = searchQuery.toLowerCase();
    return dataBarang.filter(d => 
      (d.kode_barang || "").toLowerCase().includes(lower) || 
      (d.nama_barang || "").toLowerCase().includes(lower) ||
      (d.jenis_pekerjaan || "").toLowerCase().includes(lower)
    );
  }, [dataBarang, searchQuery]);

  const groupedData = useMemo(() => {
    const groups: Record<string, any[]> = {};
    
    // Inisialisasi folder dari master_pekerjaan
    dataPekerjaan.forEach(p => {
      groups[p.nama_pekerjaan] = [];
    });
    // Folder umum wajib ada di akhir
    groups['Umum'] = [];

    // Kelompokkan data
    filteredData.forEach(item => {
      const jp = item.jenis_pekerjaan || 'Umum';
      if (!groups[jp]) groups[jp] = [];
      groups[jp].push(item);
    });

    return groups;
  }, [filteredData, dataPekerjaan]);

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const toggleFolder = (folderName: string) => {
    const newSet = new Set(expandedFolders);
    if (newSet.has(folderName)) newSet.delete(folderName);
    else newSet.add(folderName);
    setExpandedFolders(newSet);
  };

  const generateCode = () => {
    const randomNum = Math.floor(100 + Math.random() * 900);
    setForm({ ...form, kode_barang: `BRG-${randomNum}` });
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setForm({
      kode_barang: item.kode_barang,
      nama_barang: item.nama_barang,
      satuan_default: item.satuan_default,
      jenis_barang_default: item.jenis_barang_default,
      jenis_pekerjaan: item.jenis_pekerjaan || "Umum",
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({
      kode_barang: "",
      nama_barang: "",
      satuan_default: "Pcs",
      jenis_barang_default: "habis_pakai",
      jenis_pekerjaan: "Umum",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const formData = new FormData();
        if (editingId) formData.append("id", editingId);
        formData.append("kode_barang", form.kode_barang);
        formData.append("nama_barang", form.nama_barang);
        formData.append("satuan_default", form.satuan_default);
        formData.append("jenis_barang_default", form.jenis_barang_default);
        formData.append("jenis_pekerjaan", form.jenis_pekerjaan);

        await saveMasterBarang(formData);
        handleCancel();
      } catch (err: any) {
        alert("Gagal menyimpan: " + err.message);
      }
    });
  };

  const handleToggle = (id: string, aktif: boolean) => {
    const actionText = aktif ? "mengaktifkan" : "menonaktifkan";
    setConfirmConfig({
      isOpen: true,
      title: aktif ? "Aktifkan Barang" : "Nonaktifkan Barang",
      message: `Apakah Anda yakin ingin ${actionText} barang ini? Barang yang nonaktif tidak akan muncul lagi di pilihan transaksi baru.`,
      isDestructive: !aktif,
      action: () => {
        startTransition(async () => {
          try {
            await toggleMasterBarang(id, aktif);
          } catch (err) {
            alert("Gagal mengubah status.");
          }
        });
      }
    });
  };

  return (
    <div className="space-y-6 relative">
      <ConfirmModal 
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        isDestructive={confirmConfig.isDestructive}
        onConfirm={confirmConfig.action}
        onCancel={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
      />

      {/* MODAL PEKERJAAN */}
      {isPekerjaanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-surface w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95">
            <div className="flex justify-between items-center p-5 border-b border-surface-border">
              <div>
                <h2 className="text-xl font-bold">Laci Pekerjaan</h2>
                <p className="text-sm text-ink-muted">Kelola laci folder untuk menyortir barang</p>
              </div>
              <button onClick={() => setIsPekerjaanModalOpen(false)} className="text-ink-muted hover:text-bad bg-surface-muted/50 p-2 rounded-full transition-colors">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              <MasterPekerjaanClient data={dataPekerjaan} />
            </div>
          </div>
        </div>
      )}

      {/* HEADER ACTIONS */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold hidden sm:block">Kamus Data</h2>
        <Button onClick={() => setIsPekerjaanModalOpen(true)} className="w-full sm:w-auto" variant="outline">
          <LayoutGrid className="mr-2 h-4 w-4" />
          Atur Laci Pekerjaan
        </Button>
      </div>

      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
        {/* Form */}
        <form onSubmit={handleSubmit} className="rounded-2xl border border-surface-border/60 bg-surface p-6 shadow-sm transition-all hover:shadow-md">
            <h2 className="mb-4 text-lg font-semibold">{editingId ? "Edit Barang" : "Tambah Barang Baru"}</h2>
            <div className="grid gap-4 md:grid-cols-12">
              <div className="space-y-1.5 md:col-span-3">
                <Label>Kode Barang</Label>
                <div className="flex gap-2">
                  <Input required value={form.kode_barang} onChange={e => setForm({...form, kode_barang: e.target.value})} placeholder="BRG-001" className="flex-1" />
                  <Button type="button" variant="outline" size="icon" onClick={generateCode} title="Buat Kode Acak">
                    <Shuffle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-1.5 md:col-span-5">
                <Label>Nama Barang</Label>
                <Input required value={form.nama_barang} onChange={e => setForm({...form, nama_barang: e.target.value})} placeholder="Laptop..." />
              </div>
              <div className="space-y-1.5 md:col-span-4">
                <Label>Jenis Pekerjaan</Label>
                <Select value={form.jenis_pekerjaan} onValueChange={v => setForm({...form, jenis_pekerjaan: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Umum">Umum (Bisa Semua)</SelectItem>
                    {dataPekerjaan.map(p => (
                      <SelectItem key={p.id} value={p.nama_pekerjaan}>{p.nama_pekerjaan}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 md:col-span-3">
                <Label>Satuan Default</Label>
                <Input 
                  list="satuan-options"
                  required 
                  value={form.satuan_default} 
                  onChange={e => setForm({...form, satuan_default: e.target.value})} 
                  placeholder="Ketik / Pilih..." 
                />
                <datalist id="satuan-options">
                  {SATUAN_UMUM.map(s => <option key={s} value={s} />)}
                </datalist>
              </div>
              <div className="space-y-1.5 md:col-span-3">
                <Label>Kategori Default</Label>
                <Select value={form.jenis_barang_default} onValueChange={v => setForm({...form, jenis_barang_default: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(JENIS_BARANG_LABEL).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                {editingId ? "Simpan Perubahan" : "Simpan Barang Baru"}
              </Button>
              {editingId && (
                <Button type="button" variant="ghost" onClick={handleCancel}>Batal</Button>
              )}
            </div>
          </form>

          {/* Control Area: Search */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
              <Input 
                type="search"
                placeholder="Cari kode atau nama barang..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-surface"
              />
            </div>
            <div className="text-sm text-ink-muted">
              Menampilkan <span className="font-medium text-ink">{filteredData.length}</span> item
            </div>
          </div>

          {/* FOLDERS VIEW */}
          <div className="space-y-4">
            {Object.entries(groupedData).map(([folderName, items]) => {
              const isExpanded = expandedFolders.has(folderName);
              const isEmpty = items.length === 0;

              return (
                <div key={folderName} className={`rounded-2xl border transition-all ${isExpanded ? 'border-surface-border bg-surface shadow-sm' : 'border-surface-border/60 bg-surface/50 hover:bg-surface'}`}>
                  {/* Folder Header */}
                  <div 
                    onClick={() => toggleFolder(folderName)}
                    className="flex items-center justify-between p-4 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${folderName === 'Umum' ? 'bg-surface-muted text-ink-muted' : 'bg-accent/10 text-accent'}`}>
                        <LayoutGrid className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{folderName}</h3>
                        <p className="text-xs text-ink-muted">{items.length} Barang Terdaftar</p>
                      </div>
                    </div>
                    <div className="text-ink-muted">
                      {isExpanded ? '▲' : '▼'}
                    </div>
                  </div>

                  {/* Folder Content */}
                  {isExpanded && (
                    <div className="border-t border-surface-border p-0 overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-surface-muted/30 text-ink-muted border-b border-surface-border">
                          <tr>
                            <th className="px-4 py-3 font-medium">Kode</th>
                            <th className="px-4 py-3 font-medium">Nama Barang</th>
                            <th className="px-4 py-3 font-medium">Satuan</th>
                            <th className="px-4 py-3 font-medium">Kategori</th>
                            <th className="px-4 py-3 font-medium">Status</th>
                            <th className="px-4 py-3 font-medium text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-border/60">
                          {isEmpty ? (
                            <tr>
                              <td colSpan={6} className="px-4 py-8 text-center text-ink-muted">
                                Laci kosong. Belum ada barang di {folderName}.
                              </td>
                            </tr>
                          ) : (
                            items.map((row: any) => (
                              <tr key={row.id} className={`hover:bg-surface-muted/30 transition-colors ${!row.aktif ? "bg-surface-muted/20 opacity-60" : ""}`}>
                                <td className="px-4 py-3 font-medium text-ink">{row.kode_barang}</td>
                                <td className="px-4 py-3 font-medium text-ink">{row.nama_barang}</td>
                                <td className="px-4 py-3">{row.satuan_default}</td>
                                <td className="px-4 py-3">
                                  <span className="text-[10px] bg-surface-muted/80 border border-surface-border px-1.5 py-0.5 rounded text-ink-muted uppercase font-bold tracking-wider">
                                    {(JENIS_BARANG_LABEL as any)[row.jenis_barang_default]}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  {row.aktif ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-good/10 px-2 py-0.5 text-xs font-medium text-good">
                                      <CheckCircle2 className="h-3 w-3"/> Aktif
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-bad/10 px-2 py-0.5 text-xs font-medium text-bad">
                                      <XCircle className="h-3 w-3"/> Nonaktif
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center justify-end gap-2">
                                    <Button 
                                      type="button"
                                      variant="outline" 
                                      size="sm" 
                                      onClick={() => handleEdit(row)} 
                                      className="h-8 px-2 text-ink-muted hover:text-ink hover:border-ink/20 shadow-sm"
                                      title="Edit Barang"
                                    >
                                      <Edit2 className="h-4 w-4 sm:mr-2" /> 
                                      <span className="hidden sm:inline">Edit</span>
                                    </Button>
                                    <Button 
                                      type="button"
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleToggle(row.id, !row.aktif)}
                                      disabled={isPending}
                                      title={row.aktif ? "Nonaktifkan" : "Aktifkan"}
                                      className={`h-8 px-2 shadow-sm ${row.aktif ? "text-bad hover:bg-bad/10 border-bad/20" : "text-good hover:bg-good/10 border-good/20"}`}
                                    >
                                      {row.aktif ? <Ban className="h-4 w-4 sm:mr-2" /> : <CheckCircle className="h-4 w-4 sm:mr-2" />}
                                      <span className="hidden sm:inline">{row.aktif ? "Nonaktifkan" : "Aktifkan"}</span>
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
      </div>

      {isPending && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-white p-8 shadow-2xl border border-surface-border">
            <Loader2 className="h-12 w-12 animate-spin text-accent" />
            <p className="text-lg font-bold text-ink animate-pulse">Menyimpan Kamus Data...</p>
          </div>
        </div>
      )}
    </div>
  );
}
