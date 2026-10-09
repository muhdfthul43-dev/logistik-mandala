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

export function LaporanClient({ masterPekerjaan }: { masterPekerjaan: any[] }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  
  const [filters, setFilters] = useState({
    mat: ["MAT-001", "MAT-002", "MAT-003", "MAT-004"],
    jenis_barang: "semua",
    jenis_pekerjaan: "semua",
    status_pemenuhan: "semua",
    search: "",
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
            
            <div className="space-y-3 col-span-full lg:col-span-1">
              <Label>Fase Dokumen (MAT)</Label>
              <div className="flex flex-wrap gap-4 pt-1">
                {["MAT-001", "MAT-002", "MAT-003", "MAT-004"].map(mat => (
                  <label key={mat} className="flex items-center gap-2 text-sm">
                    <input 
                      type="checkbox" 
                      className="rounded border-surface-border"
                      checked={filters.mat.includes(mat)}
                      onChange={() => handleMatToggle(mat)}
                    />
                    {mat}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Pencarian</Label>
              <Input 
                placeholder="Cari nama barang, no. dokumen..." 
                value={filters.search} 
                onChange={e => setFilters({...filters, search: e.target.value})} 
              />
            </div>

            <div className="space-y-1.5">
              <Label>Status Pemenuhan</Label>
              <Select value={filters.status_pemenuhan} onValueChange={v => setFilters({...filters, status_pemenuhan: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua Status</SelectItem>
                  <SelectItem value="belum">Belum Terpenuhi (0)</SelectItem>
                  <SelectItem value="sebagian">Terpenuhi Sebagian</SelectItem>
                  <SelectItem value="penuh">Sudah Terpenuhi Penuh</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Kategori Barang</Label>
              <Select value={filters.jenis_barang} onValueChange={v => setFilters({...filters, jenis_barang: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua Kategori</SelectItem>
                  <SelectItem value="habis_pakai">Habis Pakai</SelectItem>
                  <SelectItem value="aset_tetap">Aset Tetap</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Jenis Pekerjaan</Label>
              <Select value={filters.jenis_pekerjaan} onValueChange={v => setFilters({...filters, jenis_pekerjaan: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua Pekerjaan</SelectItem>
                  {masterPekerjaan.map(mp => (
                    <SelectItem key={mp.id} value={mp.nama_pekerjaan}>{mp.nama_pekerjaan}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Filter Waktu Pengajuan</Label>
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
              <div className="col-span-full md:col-span-2 lg:col-span-1 flex gap-4">
                <div className="flex-1 space-y-1.5"><Label>Tgl Awal</Label><Input type="date" value={filters.tgl_awal} onChange={e => setFilters({...filters, tgl_awal: e.target.value})} /></div>
                <div className="flex-1 space-y-1.5"><Label>Tgl Akhir</Label><Input type="date" value={filters.tgl_akhir} onChange={e => setFilters({...filters, tgl_akhir: e.target.value})} /></div>
              </div>
            )}
            
            {filters.waktu === 'bulan' && (
              <div className="col-span-full md:col-span-2 lg:col-span-1 flex gap-4">
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
            <Button onClick={loadData} disabled={loading} className="bg-ink hover:bg-ink/90 text-surface">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              Tampilkan Preview
            </Button>
            <Button onClick={handlePrint} variant="outline" disabled={data.length === 0} className="border-ink text-ink hover:bg-ink/5">
              <Printer className="mr-2 h-4 w-4" />
              Cetak PDF
            </Button>
          </div>
        </div>
      </div>

      {/* AREA CETAK - Tampil di layar saat preview, format khusus saat print */}
      {data.length > 0 && (
        <div className="mt-8 overflow-hidden rounded-xl bg-white p-8 text-black shadow-lg print:m-0 print:p-0 print:shadow-none font-serif text-[13px]">
          
          {/* Kop Surat Modern */}
          <div className="mb-8 flex items-center justify-between border-b-[3px] border-black pb-5">
            <div className="flex items-center gap-6">
              <Image src="/logo-sttm.png" alt="Logo STTM" width={100} height={100} className="h-[90px] w-auto grayscale" />
              <div>
                <h1 className="text-[22px] font-black uppercase tracking-wider text-black">SEKOLAH TINGGI TEKNOLOGI MANDALA</h1>
                <p className="text-[15px] font-medium mt-1">Jl. Soekarno Hatta No. 597, Kota Bandung, Jawa Barat</p>
                <p className="text-[14px]">Email: rektoratmandala@gmail.com | Website: sttmandala.ac.id</p>
              </div>
            </div>
          </div>

          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold uppercase underline tracking-wide">Laporan Riwayat Pengadaan Barang</h2>
            <div className="mt-3 inline-flex flex-wrap justify-center gap-x-6 gap-y-2 rounded-md border border-gray-300 p-3 text-sm bg-gray-50">
              <p><strong>Periode:</strong> {filters.waktu === 'semua' ? 'Keseluruhan' : filters.waktu === 'tanggal' ? `${filters.tgl_awal} s/d ${filters.tgl_akhir}` : filters.waktu === 'bulan' ? `Bulan ${filters.bulan}/${filters.tahun}` : `Tahun ${filters.tahun}`}</p>
              <p><strong>MAT:</strong> {filters.mat.length === 4 ? 'Semua MAT' : filters.mat.join(', ')}</p>
              <p><strong>Jenis:</strong> {filters.jenis_barang === 'semua' ? 'Semua Kategori' : (JENIS_BARANG_LABEL as any)[filters.jenis_barang]}</p>
              <p><strong>Status:</strong> {filters.status_pemenuhan === 'semua' ? 'Semua Status' : filters.status_pemenuhan === 'penuh' ? 'Sudah Terpenuhi Penuh' : filters.status_pemenuhan === 'sebagian' ? 'Terpenuhi Sebagian' : 'Belum Terpenuhi'}</p>
            </div>
          </div>

          {/* Tabel Isi Laporan Modern */}
          <table className="mb-8 w-full border-collapse border border-gray-400 text-xs text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-400 p-2.5 text-center font-bold w-[4%]" rowSpan={2}>NO</th>
                <th className="border border-gray-400 p-2.5 font-bold w-[16%]" rowSpan={2}>DOKUMEN PENGADAAN</th>
                <th className="border border-gray-400 p-2.5 font-bold w-[22%]" rowSpan={2}>NAMA BARANG & MERK</th>
                <th className="border border-gray-400 p-2.5 font-bold w-[12%]" rowSpan={2}>JENIS PEKERJAAN</th>
                <th className="border border-gray-400 p-2.5 text-center font-bold" colSpan={3}>KUANTITAS</th>
                <th className="border border-gray-400 p-2.5 font-bold w-[16%]" rowSpan={2}>KETERANGAN / TGL</th>
              </tr>
              <tr className="bg-gray-100">
                <th className="border border-gray-400 p-2 text-center font-bold w-[8%]">DIAJUKAN</th>
                <th className="border border-gray-400 p-2 text-center font-bold w-[8%]">TERPENUHI</th>
                <th className="border border-gray-400 p-2 text-center font-bold w-[8%]">SATUAN</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => {
                const statusColor = (row.jumlah_terpenuhi >= row.jumlah_diajukan) && row.jumlah_diajukan > 0 
                  ? "bg-green-50" 
                  : (row.jumlah_terpenuhi > 0 ? "bg-yellow-50" : "");
                  
                return (
                  <tr key={row.id} className={`${statusColor} hover:bg-gray-50`}>
                    <td className="border border-gray-400 p-2.5 text-center">{idx + 1}</td>
                    <td className="border border-gray-400 p-2.5">
                      <div className="font-semibold text-xs">{row.pengajuan.nomor_pengajuan}</div>
                      <div className="text-[10px] text-gray-600 mt-0.5">{row.pengajuan.mat_kode} / {row.jenis_barang === 'aset_tetap' ? 'Aset' : 'Habis Pakai'}</div>
                    </td>
                    <td className="border border-gray-400 p-2.5">
                      <div className="font-bold">{row.nama_barang}</div>
                      {(row.merk || row.ukuran_volume) && (
                        <div className="text-[10px] text-gray-600 mt-0.5">{row.merk || '-'} {row.ukuran_volume ? `(${row.ukuran_volume})` : ''}</div>
                      )}
                    </td>
                    <td className="border border-gray-400 p-2.5">{row.jenis_pekerjaan || '-'}</td>
                    <td className="border border-gray-400 p-2.5 text-center">{row.jumlah_diajukan}</td>
                    <td className="border border-gray-400 p-2.5 text-center font-bold">{row.jumlah_terpenuhi || 0}</td>
                    <td className="border border-gray-400 p-2.5 text-center">{row.satuan}</td>
                    <td className="border border-gray-400 p-2.5">
                      {row.tanggal_penerimaan && (
                        <div className="text-[10px] text-gray-600 mb-1">Tgl: {new Date(row.tanggal_penerimaan).toLocaleDateString('id-ID')}</div>
                      )}
                      <div className="text-[11px] leading-tight">{row.keterangan || '-'}</div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Ringkasan Modern */}
          <div className="mb-14 rounded-lg border-2 border-black p-5 flex flex-col md:flex-row justify-between items-center gap-6 bg-gray-50">
            <div>
              <h3 className="text-lg font-black tracking-wide">RINGKASAN REKAPITULASI</h3>
              <p className="text-sm text-gray-600 mt-1">Total pencatatan berdasarkan filter di atas</p>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm font-medium">
              <p className="text-gray-600">Total Dokumen</p><p className="text-right">{recordIds.size} Surat</p>
              <p className="text-gray-600">Total Jenis Barang</p><p className="text-right">{itemTerpenuhi} Item</p>
              <div className="col-span-2 h-[1px] bg-gray-300 my-1"></div>
              <p className="text-gray-600">Total Unit Diajukan</p><p className="text-right">{totalDiajukan} {totalDiajukan > 0 && totalDiajukan === totalDipenuhi ? '(Lunas)' : ''}</p>
              <p className="font-bold text-black">Total Unit Terpenuhi</p><p className="font-bold text-right text-black">{totalDipenuhi}</p>
            </div>
          </div>

          {/* Tanda Tangan Formal */}
          <div className="flex justify-between text-center text-sm px-8">
            <div className="space-y-24">
              <div>
                <p>Menyetujui,</p>
                <p className="font-bold mt-0.5">Koord. Administrasi & Logistik</p>
              </div>
              <div>
                <p className="font-bold underline tracking-wide">AI RUKMAWATI, S.T., M.T.</p>
                <p className="text-xs text-gray-600">NIDN: ...............................</p>
              </div>
            </div>
            
            <div className="space-y-24">
              <div>
                <p>Mengetahui,</p>
                <p className="font-bold mt-0.5">Pimpinan Proyek STT Mandala</p>
              </div>
              <div>
                <p className="font-bold underline tracking-wide">.....................................................</p>
                <p className="text-xs text-gray-600">NIP/NIDN: ...............................</p>
              </div>
            </div>

            <div className="space-y-24">
              <div>
                <p>Bandung, {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p className="font-bold mt-0.5">Petugas Pencetak Laporan</p>
              </div>
              <div>
                <p className="font-bold underline tracking-wide">(Admin Logistik)</p>
                <p className="text-xs text-gray-600">Tanda Tangan & Nama Terang</p>
              </div>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}
