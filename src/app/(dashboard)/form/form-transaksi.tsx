"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveTransaksi } from "./actions";
import { MAT_KODE_LABEL, JENIS_BARANG_LABEL, SATUAN_UMUM } from "@/lib/types";

export function FormTransaksi({ initialData, masterBarang, masterPekerjaan }: { initialData?: any, masterBarang: any[], masterPekerjaan: any[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [header, setHeader] = useState({
    id: initialData?.id || "",
    nomor_pengajuan: initialData?.nomor_pengajuan || "",
    mat_kode: initialData?.mat_kode || "MAT-001",
    perihal: initialData?.perihal || "",
    catatan: initialData?.catatan || "",
  });

  const createEmptyItem = () => ({
    id: "",
    master_barang_id: null,
    kode_barang_manual: null,
    input_kode: "",
    nama_barang: "",
    satuan: "Pcs",
    jenis_barang: "habis_pakai",
    merk: "",
    ukuran_volume: "",
    jumlah_diajukan: "",
    jumlah_terpenuhi: "0",
    keterangan: "",
    tanggal_pengajuan: new Date().toISOString().split("T")[0],
    tanggal_penerimaan: "",
    jenis_pekerjaan: "",
  });

  const [items, setItems] = useState<any[]>(
    initialData?.items?.length > 0
      ? initialData.items.map((i: any) => ({
          ...i,
          input_kode: i.master_barang_id 
            ? masterBarang.find(m => m.id === i.master_barang_id)?.kode_barang 
            : i.kode_barang_manual || "",
        }))
      : [createEmptyItem()]
  );

  const handleKodeChange = (index: number, value: string) => {
    const newItems = [...items];
    const item = newItems[index];
    item.input_kode = value;
    
    const matched = masterBarang.find(m => m.kode_barang.toLowerCase() === value.toLowerCase());
    if (matched) {
      item.master_barang_id = matched.id;
      item.kode_barang_manual = null;
      item.nama_barang = matched.nama_barang;
      item.satuan = matched.satuan_default;
      item.jenis_barang = matched.jenis_barang_default;
    } else {
      item.master_barang_id = null;
      item.kode_barang_manual = value || null;
    }
    setItems(newItems);
  };

  const handleNamaChange = (index: number, value: string) => {
    const newItems = [...items];
    const item = newItems[index];
    item.nama_barang = value;
    
    // Check if the exact name matches a master item
    const matched = masterBarang.find(m => m.nama_barang.toLowerCase() === value.toLowerCase());
    if (matched) {
      item.master_barang_id = matched.id;
      item.input_kode = matched.kode_barang;
      item.kode_barang_manual = null;
      item.satuan = matched.satuan_default;
      item.jenis_barang = matched.jenis_barang_default;
    } else {
      item.master_barang_id = null;
      if (!item.kode_barang_manual) {
        item.kode_barang_manual = item.input_kode || null;
      }
    }
    setItems(newItems);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItem = () => setItems([...items, createEmptyItem()]);
  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const payloadItems = items.map(i => {
          const res = { ...i };
          delete res.input_kode; // virtual field
          if (!res.master_barang_id && res.kode_barang_manual === "") {
            res.kode_barang_manual = null;
          }
          return res;
        });

        await saveTransaksi({ ...header, items: payloadItems });
        router.push(header.mat_kode === 'MAT-004' ? '/selesai' : '/berjalan');
      } catch (error: any) {
        alert("Gagal menyimpan: " + error.message);
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {/* DATALISTS FOR AUTOCOMPLETE */}
      <datalist id="master-kode-list">
        {masterBarang.map(m => <option key={`kode-${m.id}`} value={m.kode_barang}>{m.nama_barang}</option>)}
      </datalist>
      <datalist id="master-nama-list">
        {masterBarang.map(m => <option key={`nama-${m.id}`} value={m.nama_barang}>{m.kode_barang} - {m.jenis_barang_default}</option>)}
      </datalist>
      <datalist id="satuan-options-form">
        {SATUAN_UMUM.map(s => <option key={s} value={s} />)}
      </datalist>

      <div className="rounded-2xl border border-surface-border/60 bg-surface p-6 shadow-sm transition-all md:p-8">
        <h2 className="mb-6 text-xl font-bold">Header Dokumen</h2>
        <div className="grid gap-6 md:grid-cols-2">
          
          <div className="space-y-1.5">
            <Label>Nomor Dokumen <span className="text-bad">*</span></Label>
            <Input 
              value={header.nomor_pengajuan} 
              onChange={(e) => setHeader({ ...header, nomor_pengajuan: e.target.value })} 
              placeholder="Contoh: PKB/2026/10/003 (Dibuat otomatis jika kosong)" 
            />
          </div>

          <div className="space-y-1.5">
            <Label>Fase Dokumen (MAT)</Label>
            <Select value={header.mat_kode} onValueChange={(v) => setHeader({ ...header, mat_kode: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(MAT_KODE_LABEL).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{k} - {v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <Label>Perihal Dokumen <span className="text-bad">*</span></Label>
            <Input 
              value={header.perihal} 
              onChange={(e) => setHeader({ ...header, perihal: e.target.value })} 
              placeholder="Untuk mendukung pelaksanaan kegiatan..." 
              required 
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <Label>Catatan Tambahan (Opsional)</Label>
            <Input 
              value={header.catatan || ''} 
              onChange={(e) => setHeader({ ...header, catatan: e.target.value })} 
              placeholder="Catatan umum dokumen" 
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Daftar Barang</h2>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Baris
          </Button>
        </div>

        {items.map((item, idx) => {
          const s = (item.jumlah_terpenuhi || 0);
          const d = (item.jumlah_diajukan || 0);
          let statusColor = "bg-bad";
          let statusText = "Belum";
          if (s > 0 && s < d) {
            statusColor = "bg-warn";
            statusText = "Sebagian";
          } else if (s > 0 && s >= d) {
            statusColor = "bg-good";
            statusText = "Penuh";
          }

          return (
            <div key={idx} className={`relative rounded-2xl border ${item.master_barang_id ? 'border-good/40 bg-good/5' : 'border-surface-border/60 bg-surface'} p-5 shadow-sm transition-all duration-300 hover:shadow-md`}>
              <button 
                type="button" 
                onClick={() => removeItem(idx)}
                className="absolute right-4 top-4 text-ink-muted hover:text-bad"
              >
                <Trash2 className="h-5 w-5" />
              </button>
              
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-muted text-xs font-medium">
                  {idx + 1}
                </span>
                <div className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium text-white ${statusColor}`}>
                  {statusText}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-12">
                
                {/* AUTOCOMPLETE KODE & NAMA */}
                <div className="space-y-1.5 md:col-span-2">
                  <Label>Kode Barang</Label>
                  <Input 
                    list="master-kode-list"
                    value={item.input_kode} 
                    onChange={(e) => handleKodeChange(idx, e.target.value)}
                    placeholder="Pilih/Ketik..." 
                    className={item.master_barang_id ? "border-good/50 focus-visible:ring-good" : ""}
                  />
                  {item.master_barang_id ? (
                    <p className="flex items-center gap-1 text-[10px] font-medium text-good"><CheckCircle2 className="h-3 w-3"/> Terhubung</p>
                  ) : item.input_kode ? (
                    <p className="flex items-center gap-1 text-[10px] font-medium text-warn"><AlertCircle className="h-3 w-3"/> Manual</p>
                  ) : null}
                </div>

                <div className="space-y-1.5 md:col-span-4">
                  <Label>Nama Barang <span className="text-bad">*</span></Label>
                  <Input 
                    list="master-nama-list"
                    value={item.nama_barang} 
                    onChange={(e) => handleNamaChange(idx, e.target.value)}
                    required 
                    placeholder="Cari dari Kamus Data..."
                    className={item.master_barang_id ? "border-good/50 focus-visible:ring-good font-semibold" : ""}
                  />
                </div>

                <div className="space-y-1.5 md:col-span-3">
                  <Label>Jenis Pekerjaan</Label>
                  <Select value={item.jenis_pekerjaan || ""} onValueChange={(v) => updateItem(idx, 'jenis_pekerjaan', v)}>
                    <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                    <SelectContent>
                      {masterPekerjaan.map(mp => (
                        <SelectItem key={mp.id} value={mp.nama_pekerjaan}>{mp.nama_pekerjaan}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 md:col-span-3">
                  <Label>Merk</Label>
                  <Input 
                    value={item.merk || ''} 
                    onChange={(e) => updateItem(idx, 'merk', e.target.value)}
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <Label>Ukuran / Vol</Label>
                  <Input 
                    value={item.ukuran_volume || ''} 
                    onChange={(e) => updateItem(idx, 'ukuran_volume', e.target.value)}
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <Label>Satuan</Label>
                  <Input 
                    list="satuan-options-form"
                    required 
                    value={item.satuan} 
                    onChange={(e) => updateItem(idx, 'satuan', e.target.value)} 
                    placeholder="Ketik / Pilih..." 
                    disabled={!!item.master_barang_id}
                    className={item.master_barang_id ? "bg-surface-muted opacity-70" : ""}
                  />
                </div>
                
                <div className="space-y-1.5 md:col-span-3">
                  <Label>Kategori Barang</Label>
                  <Select value={item.jenis_barang} onValueChange={(v) => updateItem(idx, 'jenis_barang', v)} disabled={!!item.master_barang_id}>
                    <SelectTrigger className={item.master_barang_id ? "bg-surface-muted opacity-70" : ""}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(JENIS_BARANG_LABEL).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <Label>Jml Diajukan</Label>
                  <Input 
                    type="number" min="0" 
                    value={item.jumlah_diajukan} 
                    onChange={(e) => updateItem(idx, 'jumlah_diajukan', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5 md:col-span-3">
                  <Label>Jml Terpenuhi</Label>
                  <Input 
                    type="number" min="0" 
                    value={item.jumlah_terpenuhi} 
                    onChange={(e) => updateItem(idx, 'jumlah_terpenuhi', e.target.value)}
                  />
                </div>

                <div className="space-y-1.5 md:col-span-3">
                  <Label>Tgl Pengajuan</Label>
                  <Input 
                    type="date" 
                    value={item.tanggal_pengajuan || ''} 
                    onChange={(e) => updateItem(idx, 'tanggal_pengajuan', e.target.value)}
                  />
                </div>

                <div className="space-y-1.5 md:col-span-3">
                  <Label>Tgl Penerimaan</Label>
                  <Input 
                    type="date" 
                    value={item.tanggal_penerimaan || ''} 
                    onChange={(e) => updateItem(idx, 'tanggal_penerimaan', e.target.value)}
                  />
                </div>
                
                <div className="space-y-1.5 md:col-span-6">
                  <Label>Keterangan / Catatan Tambahan</Label>
                  <Input 
                    value={item.keterangan || ''} 
                    onChange={(e) => updateItem(idx, 'keterangan', e.target.value)}
                    placeholder="Alasan pemenuhan parsial..." 
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-surface-border/60 bg-surface p-6 shadow-sm transition-all md:flex-row md:items-center md:justify-end sticky bottom-6 z-20">
        <Button type="button" variant="ghost" onClick={() => router.back()}>Batal</Button>
        <Button type="submit" disabled={isPending || items.length === 0}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Simpan Transaksi
        </Button>
      </div>
    </form>
  );
}
