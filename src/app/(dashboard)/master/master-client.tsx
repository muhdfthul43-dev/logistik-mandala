"use client";

import { useState, useTransition, useDeferredValue, useMemo } from "react";
import { Loader2, Plus, Edit2, Ban, CheckCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveMasterBarang, toggleMasterBarang } from "./actions";
import { JENIS_BARANG_LABEL, SATUAN_UMUM } from "@/lib/types";

export function MasterClient({ data }: { data: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Fitur Pencarian Real-Time & Performa Tinggi (React 18 Concurrent Features)
  const [searchQuery, setSearchQuery] = useState("");
  const deferredQuery = useDeferredValue(searchQuery);

  const filteredData = useMemo(() => {
    if (!deferredQuery) return data;
    const lowerQuery = deferredQuery.toLowerCase();
    return data.filter(
      (item) =>
        item.kode_barang.toLowerCase().includes(lowerQuery) ||
        item.nama_barang.toLowerCase().includes(lowerQuery)
    );
  }, [data, deferredQuery]);

  const [form, setForm] = useState({
    id: "",
    kode_barang: "",
    nama_barang: "",
    satuan_default: "Pcs",
    jenis_barang_default: "habis_pakai",
  });

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setForm({
      id: item.id,
      kode_barang: item.kode_barang,
      nama_barang: item.nama_barang,
      satuan_default: item.satuan_default,
      jenis_barang_default: item.jenis_barang_default,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({
      id: "", kode_barang: "", nama_barang: "", satuan_default: "Pcs", jenis_barang_default: "habis_pakai"
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const formData = new FormData();
      if (form.id) formData.append("id", form.id);
      formData.append("kode_barang", form.kode_barang);
      formData.append("nama_barang", form.nama_barang);
      formData.append("satuan_default", form.satuan_default);
      formData.append("jenis_barang_default", form.jenis_barang_default);
      
      try {
        await saveMasterBarang(formData);
        handleCancel();
      } catch (err) {
        alert("Gagal menyimpan data.");
      }
    });
  };

  const handleToggle = (id: string, aktif: boolean) => {
    startTransition(async () => {
      try {
        await toggleMasterBarang(id, aktif);
      } catch (err) {
        alert("Gagal mengubah status.");
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Form */}
      <form onSubmit={handleSubmit} className="rounded-2xl border border-surface-border/60 bg-surface p-6 shadow-sm transition-all hover:shadow-md">
        <h2 className="mb-4 text-lg font-semibold">{editingId ? "Edit Barang" : "Tambah Barang Baru"}</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-1.5">
            <Label>Kode Barang</Label>
            <Input required value={form.kode_barang} onChange={e => setForm({...form, kode_barang: e.target.value})} placeholder="BRG-001" />
          </div>
          <div className="space-y-1.5">
            <Label>Nama Barang</Label>
            <Input required value={form.nama_barang} onChange={e => setForm({...form, nama_barang: e.target.value})} placeholder="Laptop..." />
          </div>
          <div className="space-y-1.5">
            <Label>Satuan Default</Label>
            <Select value={form.satuan_default} onValueChange={v => setForm({...form, satuan_default: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SATUAN_UMUM.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Jenis Default</Label>
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
            Simpan
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
              <th className="px-4 py-3 font-medium">Jenis</th>
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
                  <td className="px-4 py-3 font-medium">{row.kode_barang}</td>
                  <td className="px-4 py-3">{row.nama_barang}</td>
                  <td className="px-4 py-3">{row.satuan_default}</td>
                  <td className="px-4 py-3">{(JENIS_BARANG_LABEL as any)[row.jenis_barang_default]}</td>
                  <td className="px-4 py-3">
                    {row.aktif ? (
                      <span className="rounded-full bg-good/10 px-2 py-0.5 text-xs font-medium text-good">✅ Aktif</span>
                    ) : (
                      <span className="rounded-full bg-bad/10 px-2 py-0.5 text-xs font-medium text-bad">❌ Nonaktif</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEdit(row)} className="rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-surface hover:text-ink hover:shadow-sm">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleToggle(row.id, !row.aktif)}
                        disabled={isPending}
                        title={row.aktif ? "Nonaktifkan" : "Aktifkan"}
                        className={`rounded-lg p-1.5 transition-colors hover:shadow-sm ${row.aktif ? "text-bad hover:bg-bad/10" : "text-good hover:bg-good/10"}`}
                      >
                        {row.aktif ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
