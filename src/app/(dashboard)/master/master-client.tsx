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
  const [activeTab, setActiveTab] = useState<'barang' | 'pekerjaan'>('barang');
  const [searchQuery, setSearchQuery] = useState("");
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    kode_barang: "",
    nama_barang: "",
    satuan_default: "Pcs",
    jenis_barang_default: "habis_pakai",
  });

  const [confirmConfig, setConfirmConfig] = useState<{ isOpen: boolean; title: string; message: string; isDestructive: boolean; action: () => void }>({
    isOpen: false, title: "", message: "", isDestructive: false, action: () => {}
  });

  const filteredData = useMemo(() => {
    if (!searchQuery) return dataBarang;
    const lower = searchQuery.toLowerCase();
    return dataBarang.filter(d => 
      (d.kode_barang || "").toLowerCase().includes(lower) || 
      (d.nama_barang || "").toLowerCase().includes(lower)
    );
  }, [dataBarang, searchQuery]);

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

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-surface-border pb-4">
        <button 
          onClick={() => setActiveTab('barang')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'barang' ? 'bg-ink text-surface shadow-sm' : 'text-ink-muted hover:bg-surface-muted hover:text-ink'}`}
        >
          <Box className="h-4 w-4" /> Daftar Barang
        </button>
        <button 
          onClick={() => setActiveTab('pekerjaan')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'pekerjaan' ? 'bg-ink text-surface shadow-sm' : 'text-ink-muted hover:bg-surface-muted hover:text-ink'}`}
        >
          <LayoutGrid className="h-4 w-4" /> Jenis Pekerjaan
        </button>
      </div>

      {activeTab === 'pekerjaan' && (
        <MasterPekerjaanClient data={dataPekerjaan} />
      )}

      {activeTab === 'barang' && (
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
              <div className="space-y-1.5 md:col-span-4">
                <Label>Nama Barang</Label>
                <Input required value={form.nama_barang} onChange={e => setForm({...form, nama_barang: e.target.value})} placeholder="Laptop..." />
              </div>
              <div className="space-y-1.5 md:col-span-2">
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

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-surface-border/60 bg-surface shadow-sm transition-all hover:shadow-md">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-surface-border bg-surface-muted/50 text-ink-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Kode</th>
                  <th className="px-4 py-3 font-medium">Nama Barang</th>
                  <th className="px-4 py-3 font-medium">Satuan</th>
                  <th className="px-4 py-3 font-medium">Jenis Kategori</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/60">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-ink-muted">
                      Barang tidak ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredData.map(row => (
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
        </div>
      )}
    </div>
  );
}
