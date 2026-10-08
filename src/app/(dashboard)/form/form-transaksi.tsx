"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveTransaksi } from "./actions";
import { MAT_KODE_LABEL, JENIS_BARANG_LABEL, SATUAN_UMUM } from "@/lib/types";

export function FormTransaksi({ initialData, masterBarang }: { initialData?: any, masterBarang: any[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [header, setHeader] = useState({
    id: initialData?.id || "",
    mat_kode: initialData?.mat_kode || "MAT-001",
    perihal: initialData?.perihal || "",
    catatan: initialData?.catatan || "",
  });

  const [items, setItems] = useState<any[]>(
    initialData?.items?.length > 0
      ? initialData.items.map((i: any) => ({
          ...i,
          // for display in input, we extract the kode_barang from master_barang if it exists
          input_kode: i.master_barang_id 
            ? masterBarang.find(m => m.id === i.master_barang_id)?.kode_barang 
            : i.kode_barang_manual || "",
        }))
      : [createEmptyItem()]
  );

  function createEmptyItem() {
    return {
      input_kode: "",
      master_barang_id: null,
      kode_barang_manual: null,
      jenis_pekerjaan: "",
      nama_barang: "",
      merk: "",
      ukuran_volume: "",
      satuan: "Pcs",
      jenis_barang: "habis_pakai",
      jumlah_diajukan: 0,
      jumlah_terpenuhi: 0,
      tanggal_pengajuan: "",
      tanggal_penerimaan: "",
      keterangan: "",
    };
  }

  const handleKodeChange = (index: number, value: string) => {
    const newItems = [...items];
    const item = newItems[index];
    item.input_kode = value;
    
    // Autofill logic
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

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const addItem = () => {
    setItems([...items, createEmptyItem()]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await saveTransaksi({ ...header, items });
        router.push(header.mat_kode === 'MAT-004' ? '/selesai' : '/berjalan');
      } catch (err) {
        console.error(err);
        alert("Gagal menyimpan transaksi.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-20">
      <div className="rounded-2xl border border-surface-border/60 bg-surface p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Header Pengajuan</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {initialData && (
            <div className="space-y-1.5 md:col-span-2">
              <Label>No. Dokumen</Label>
              <Input value={initialData.nomor_pengajuan} disabled className="bg-surface-muted" />
            </div>
          )}
          
          <div className="space-y-1.5 md:col-span-1">
            <Label>Fase (MAT)</Label>
            <Select 
              value={header.mat_kode} 
              onValueChange={(v) => setHeader({ ...header, mat_kode: v })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(MAT_KODE_LABEL).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 md:col-span-1">
            <Label>Perihal</Label>
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
            <div key={idx} className="relative rounded-2xl border border-surface-border/60 bg-surface p-5 shadow-sm transition-all duration-300 hover:shadow-md">
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
                {/* Baris 1: Identifikasi Utama */}
                <div className="space-y-1.5 md:col-span-2">
                  <Label>Kode Barang</Label>
                  <Input 
                    value={item.input_kode} 
                    onChange={(e) => handleKodeChange(idx, e.target.value)}
                    placeholder="BRG-..." 
                  />
                  {item.master_barang_id ? (
                    <p className="text-[10px] font-medium text-good">✓ Ditemukan</p>
                  ) : item.input_kode ? (
                    <p className="text-[10px] font-medium text-warn">⚠️ Entri Manual</p>
                  ) : null}
                </div>

                <div className="space-y-1.5 md:col-span-4">
                  <Label>Nama Barang</Label>
                  <Input 
                    value={item.nama_barang} 
                    onChange={(e) => updateItem(idx, 'nama_barang', e.target.value)}
                    required 
                  />
                </div>

                <div className="space-y-1.5 md:col-span-3">
                  <Label>Jenis Pekerjaan</Label>
                  <Input 
                    value={item.jenis_pekerjaan || ''} 
                    onChange={(e) => updateItem(idx, 'jenis_pekerjaan', e.target.value)}
                    placeholder="Contoh: ATK/IT" 
                  />
                </div>

                <div className="space-y-1.5 md:col-span-3">
                  <Label>Merk</Label>
                  <Input 
                    value={item.merk || ''} 
                    onChange={(e) => updateItem(idx, 'merk', e.target.value)}
                  />
                </div>

                {/* Baris 2: Detail Fisik & Kuantitas */}
                <div className="space-y-1.5 md:col-span-2">
                  <Label>Ukuran / Vol</Label>
                  <Input 
                    value={item.ukuran_volume || ''} 
                    onChange={(e) => updateItem(idx, 'ukuran_volume', e.target.value)}
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <Label>Satuan</Label>
                  <Select value={item.satuan} onValueChange={(v) => updateItem(idx, 'satuan', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SATUAN_UMUM.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1.5 md:col-span-3">
                  <Label>Kategori Barang</Label>
                  <Select value={item.jenis_barang} onValueChange={(v) => updateItem(idx, 'jenis_barang', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
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

                {/* Baris 3: Tanggal & Keterangan */}
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
