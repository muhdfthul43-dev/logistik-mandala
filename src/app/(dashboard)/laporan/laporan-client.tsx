"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, Printer, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getLaporanData } from "./actions";
import { JENIS_BARANG_LABEL } from "@/lib/types";

export function LaporanClient() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  
  const [filters, setFilters] = useState({
    mat: ["MAT-001", "MAT-002", "MAT-003", "MAT-004"],
    jenis_barang: "semua",
    waktu: "semua",
    tgl_awal: "",
    tgl_akhir: "",
    bulan: new Date().getMonth() + 1,
    tahun: new Date().getFullYear(),
  });

  const handleMatToggle = (mat: string) => {
    setFilters(f => {
      const newMat = f.mat.includes(mat) ? f.mat.filter(m => m !== mat) : [...f.mat, mat];
      return { ...f, mat: newMat };
    });
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await getLaporanData(filters);
      setData(result || []);
    } catch (err) {
      alert("Gagal memuat data laporan");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Kalkulasi Ringkasan
  const recordIds = new Set();
  let itemTerpenuhi = 0;
  let totalDiajukan = 0;
  let totalDipenuhi = 0;

  data.forEach(d => {
    recordIds.add(d.pengajuan.id);
    itemTerpenuhi += 1;
    totalDiajukan += (d.jumlah_diajukan || 0);
    totalDipenuhi += (d.jumlah_terpenuhi || 0);
  });

  return (
    <div>
      {/* AREA FILTER - Dihilangkan saat print */}
      <div className="print:hidden space-y-6">
        <div className="rounded-xl border border-surface-border bg-surface p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Filter Laporan</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            
            <div className="space-y-2">
              <Label>Fase (MAT)</Label>
              <div className="flex flex-wrap gap-2">
                {["MAT-001", "MAT-002", "MAT-003", "MAT-004"].map(m => (
                  <label key={m} className="flex items-center gap-1.5 text-sm">
                    <input 
                      type="checkbox" 
                      checked={filters.mat.includes(m)} 
                      onChange={() => handleMatToggle(m)} 
                      className="rounded border-surface-border"
                    /> {m}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Jenis Barang</Label>
              <Select value={filters.jenis_barang} onValueChange={v => setFilters({...filters, jenis_barang: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua Jenis</SelectItem>
                  {Object.entries(JENIS_BARANG_LABEL).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Filter Waktu</Label>
              <Select value={filters.waktu} onValueChange={v => setFilters({...filters, waktu: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Keseluruhan</SelectItem>
                  <SelectItem value="tanggal">Per Tanggal</SelectItem>
                  <SelectItem value="bulan">Per Bulan</SelectItem>
                  <SelectItem value="tahun">Per Tahun</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filters.waktu === 'tanggal' && (
              <div className="col-span-full flex gap-4">
                <div className="flex-1 space-y-1.5"><Label>Tgl Awal</Label><Input type="date" value={filters.tgl_awal} onChange={e => setFilters({...filters, tgl_awal: e.target.value})} /></div>
                <div className="flex-1 space-y-1.5"><Label>Tgl Akhir</Label><Input type="date" value={filters.tgl_akhir} onChange={e => setFilters({...filters, tgl_akhir: e.target.value})} /></div>
              </div>
            )}
            
            {filters.waktu === 'bulan' && (
              <div className="col-span-full flex gap-4">
                <div className="flex-1 space-y-1.5"><Label>Bulan</Label><Input type="number" min="1" max="12" value={filters.bulan} onChange={e => setFilters({...filters, bulan: parseInt(e.target.value)})} /></div>
                <div className="flex-1 space-y-1.5"><Label>Tahun</Label><Input type="number" value={filters.tahun} onChange={e => setFilters({...filters, tahun: parseInt(e.target.value)})} /></div>
              </div>
            )}

            {filters.waktu === 'tahun' && (
              <div className="col-span-full md:col-span-1 space-y-1.5">
                <Label>Tahun</Label><Input type="number" value={filters.tahun} onChange={e => setFilters({...filters, tahun: parseInt(e.target.value)})} />
              </div>
            )}
          </div>
          
          <div className="mt-6 flex justify-end gap-3">
            <Button onClick={loadData} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              Tampilkan Preview
            </Button>
            <Button onClick={handlePrint} variant="outline" disabled={data.length === 0}>
              <Printer className="mr-2 h-4 w-4" />
              Cetak PDF
            </Button>
          </div>
        </div>
      </div>

      {/* AREA CETAK - Tampil di layar saat preview, format khusus saat print */}
      {data.length > 0 && (
        <div className="mt-8 overflow-hidden rounded-xl bg-white p-8 text-black shadow-lg print:m-0 print:p-0 print:shadow-none font-serif text-sm">
          
          {/* Kop Surat */}
          <div className="mb-6 flex items-start gap-6 border-b-2 border-black pb-4">
            <div className="flex-shrink-0">
              <Image src="/logo-sttm.png" alt="Logo STTM" width={100} height={100} className="h-24 w-auto grayscale" />
            </div>
            <div className="flex-1 text-center">
              <h1 className="text-xl font-bold uppercase tracking-wide">Sekolah Tinggi Teknologi Mandala</h1>
              <p className="mt-1">Jl. Soekarno Hatta No. 597 Bandung</p>
              <p>Email: rektoratmandala@gmail.com</p>
            </div>
            <div className="w-24 flex-shrink-0"></div> {/* Spacer to center the text */}
          </div>

          <div className="mb-6 text-center">
            <h2 className="text-lg font-bold uppercase underline">Laporan Pengadaan Barang — Administrasi & Logistik</h2>
            <div className="mt-2 flex justify-center gap-8 text-sm">
              <p><strong>Periode:</strong> {filters.waktu === 'semua' ? 'Keseluruhan' : filters.waktu === 'tanggal' ? `${filters.tgl_awal} - ${filters.tgl_akhir}` : filters.waktu === 'bulan' ? `Bulan ${filters.bulan}/${filters.tahun}` : `Tahun ${filters.tahun}`}</p>
              <p><strong>MAT:</strong> {filters.mat.length === 4 ? 'Semua' : filters.mat.join(', ')}</p>
              <p><strong>Jenis:</strong> {filters.jenis_barang === 'semua' ? 'Semua' : (JENIS_BARANG_LABEL as any)[filters.jenis_barang]}</p>
            </div>
          </div>

          {/* Tabel Isi Laporan */}
          <table className="mb-6 w-full border-collapse border border-black text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-2 text-center" rowSpan={2}>NO</th>
                <th className="border border-black p-2" rowSpan={2}>NO. DOK<br/>MAT / JENIS</th>
                <th className="border border-black p-2" rowSpan={2}>NAMA BARANG<br/>MERK / UKURAN</th>
                <th className="border border-black p-2" rowSpan={2}>JENIS<br/>PEKERJAAN</th>
                <th className="border border-black p-2" rowSpan={2}>SAT</th>
                <th className="border border-black p-2 text-center" colSpan={3}>KUANTITAS PENGADAAN</th>
              </tr>
              <tr className="bg-gray-100">
                <th className="border border-black p-2 text-center">DIAJUKAN</th>
                <th className="border border-black p-2 text-center">TERPENUHI</th>
                <th className="border border-black p-2 text-center">TGL PENERIMAAN</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={row.id}>
                  <td className="border border-black p-2 text-center">{idx + 1}</td>
                  <td className="border border-black p-2">
                    {row.pengajuan.nomor_pengajuan}<br/>
                    {row.pengajuan.mat_kode} / {row.jenis_barang.slice(0,2).toUpperCase()}
                  </td>
                  <td className="border border-black p-2">
                    <strong>{row.nama_barang}</strong><br/>
                    {row.merk || '-'} / {row.ukuran_volume || '-'}
                  </td>
                  <td className="border border-black p-2">{row.jenis_pekerjaan || '-'}</td>
                  <td className="border border-black p-2 text-center">{row.satuan}</td>
                  <td className="border border-black p-2 text-center">{row.jumlah_diajukan}</td>
                  <td className="border border-black p-2 text-center font-bold">{row.jumlah_terpenuhi}</td>
                  <td className="border border-black p-2 text-center">{row.tanggal_penerimaan || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Ringkasan */}
          <div className="mb-12 border border-black p-4 text-sm">
            <h3 className="mb-2 text-center font-bold underline">RINGKASAN PENGADAAN</h3>
            <div className="mx-auto grid max-w-lg grid-cols-2 gap-y-2">
              <p>Jumlah Dokumen Pengajuan</p><p>: {recordIds.size} dokumen</p>
              <p>Jumlah Baris Item Logistik</p><p>: {itemTerpenuhi} baris</p>
              <div className="col-span-2 my-1 border-b border-black"></div>
              <p>Total Barang Diajukan</p><p>: {totalDiajukan} unit</p>
              <p className="font-bold">Total Barang Terpenuhi</p><p className="font-bold">: {totalDipenuhi} unit</p>
            </div>
          </div>

          {/* Tanda Tangan */}
          <div className="flex justify-between text-center text-sm">
            <div className="space-y-16">
              <div>
                <p>Menyetujui</p>
                <p>Administrasi & Logistik</p>
              </div>
              <div className="font-bold underline">AI RUKMAWATI, S.T, M.T</div>
            </div>
            
            <div className="space-y-16">
              <div>
                <p>Mengetahui</p>
                <p>Pimpinan STT Mandala</p>
              </div>
              <div className="font-bold underline">...........................</div>
            </div>

            <div className="space-y-16">
              <div>
                <p>Bandung, {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p>Yang Mengajukan</p>
              </div>
              <div className="font-bold">...........................</div>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}
