# Sistem Logistik — STT Mandala

Modul **Logistik**: pengajuan kebutuhan barang dari unit kerja, berjalan lewat
4 tahap verifikasi/persetujuan (**MAT-001 → MAT-004**), dan begitu disetujui
penuh otomatis tercatat sebagai barang masuk di **Inventaris**.

Dibangun standalone (Next.js + Supabase), selaras secara desain & pola kode
dengan modul **Inventaris Rektorat** dan **SIMBA** yang sudah ada — kategori
barang, gaya kode dokumen, dan pola laporan+PDF sengaja disamakan supaya
ketiga aplikasi terasa satu ekosistem walau repo-nya terpisah.

## Alur Singkat

```
Pemohon buat Pengajuan (MAT-001)
        │
        ▼
Staf Logistik memverifikasi (MAT-002) ──tolak──▶ Selesai (Ditolak)
        │ setuju
        ▼
Staf Logistik memproses/cek stok (MAT-003) ──tolak──▶ Selesai (Ditolak)
        │ setuju
        ▼
Pimpinan menyetujui akhir (MAT-004) ──tolak──▶ Selesai (Ditolak)
        │ setuju
        ▼
Tercatat otomatis di Inventaris Masuk
```

> **Catatan jujur:** MAT-001 s.d MAT-004 tidak ditemukan didefinisikan secara
> rinci di berkas manapun yang di-share, jadi pemetaan tahap di atas
> (Pengajuan → Verifikasi → Pemrosesan → Persetujuan Akhir) adalah interpretasi
> paling umum dari alur pengadaan 4 tahap. Kalau dosen/kampus punya definisi
> resmi yang beda, tinggal sesuaikan label & urutan di `src/lib/types.ts`
> (`TAHAP_LABEL`, `TAHAP_PENANGGUNG_JAWAB`) — struktur database & kode sudah
> generik terhadap perubahan itu, tidak perlu bongkar logic inti.

## Pemenuhan Sebagian & Barang Habis Pakai

Dua kasus nyata yang sering kejadian di procurement, keduanya sudah
didukung:

**Stok penjual terbatas** — di tahap mana pun (MAT-002/003/004), yang
bertugas boleh mengubah kolom **Dipenuhi** per barang (beda dari **Diminta**),
isi **Harga Aktual** kalau beda dari estimasi katalog, dan **Keterangan**
buat menjelaskan alasannya secara narasi (wajib diisi kalau jumlahnya beda).
Begitu pengajuan disetujui, Inventaris Masuk cuma mencatat jumlah yang
benar-benar dipenuhi. Kalau ada sisa kekurangan, muncul tombol **Buat
Pengajuan Susulan** di halaman detail — otomatis bikin pengajuan baru berisi
sisa kekurangannya saja, tertaut ke pengajuan asal.

**Barang habis pakai vs aset tetap** — tiap barang di Data Master diberi
label `jenis_barang`. Barang **Habis Pakai** (ATK, dsb — yang dikonsumsi,
bukan dipinjam-balikkan) direkap terpisah di halaman Laporan ("Rekap
Konsumsi Barang Habis Pakai") supaya kelihatan pola pemakaiannya dari waktu
ke waktu, dipakai buat memperkirakan kapan perlu restock. Barang **Aset
Tetap** (elektronik, furnitur) adalah kandidat yang perlu didaftarkan sebagai
aset individual di modul Inventaris Rektorat setelah diterima — Logistik
sendiri tidak melacak nomor seri/kondisi per unit karena itu memang di luar
tanggung jawabnya (biar tidak tumpang tindih sama modul aset punya tim lain).

## Stack

| Bagian | Teknologi |
|---|---|
| Framework | Next.js 16 (App Router, Server Actions) |
| Bahasa | TypeScript |
| Styling | Tailwind CSS v4 + komponen custom bergaya shadcn/ui |
| Database & Auth | Supabase (Postgres + Row Level Security + Supabase Auth) |
| PDF | @react-pdf/renderer (generate PDF asli di server, bukan print-to-PDF) |
| Grafik | Recharts |
| Hosting | Vercel |

## Cara Setup (Step-by-Step Lengkap)

Panduan super rinci — tiap klik, tiap command — ada di **[`PANDUAN-SETUP.md`](./PANDUAN-SETUP.md)**.
Baca itu kalau ini pertama kalinya kamu setup project Supabase + Vercel.

Ringkasan buat yang udah biasa:

1. Bikin project di [supabase.com](https://supabase.com) → jalankan
   `supabase/schema.sql` di SQL Editor → matikan **Confirm email** di
   Authentication → Providers → Email.
2. `npm install` → isi `.env.local` (copy dari `.env.example`) dengan
   Project URL & anon key dari **Project Settings → API**.
3. `npm run dev` → daftar akun pertama → jadikan admin lewat SQL:
   ```sql
   update public.profiles set role = 'admin' where full_name = 'Nama Kamu Saat Daftar';
   ```
4. Push ke GitHub → import di [vercel.com](https://vercel.com) → isi env
   vars yang sama → Deploy.

> **Sudah pernah setup sebelumnya?** Jalankan
> `supabase/migration-002-pemenuhan-parsial.sql` di SQL Editor project
> Supabase kamu yang sudah ada — ini nambahin kolom-kolom buat fitur
> pemenuhan sebagian & klasifikasi barang tanpa perlu setup ulang dari nol.
> `schema.sql` sudah memuat versi lengkapnya juga, jadi setup baru dari nol
> otomatis dapat semuanya sekaligus.

### Supaya project Supabase gratis tidak auto-pause

Supabase paket gratis menjeda database kalau tidak ada aktivitas ±7 hari.
Endpoint `/api/ping` sudah disiapkan buat jaga-jaga — daftarkan URL
`https://domain-vercel-kamu.vercel.app/api/ping` di
[cron-job.org](https://cron-job.org) (gratis) supaya dipanggil tiap 3–4 hari
sekali.

## Struktur Folder

```
supabase/
  schema.sql              -- jalankan sekali di awal
  seed-demo-data.sql       -- opsional, data contoh
docs/diagrams/              -- source .puml, siap render lewat plantuml.com
  buat draft BAB III (use case, activity, sequence)
src/
  app/
    login/                 -- halaman masuk & daftar
    (dashboard)/            -- semua halaman setelah login (sidebar+topbar)
      dashboard/            -- ringkasan & antrean "perlu tindakan Anda"
      pengajuan/             -- daftar, buat baru, detail + tombol approval
      master-data/           -- kelola kategori, unit kerja, katalog barang
      laporan/                -- rekap per kategori & per unit kerja + PDF
      inventaris/             -- ledger barang yang sudah lolos MAT-004
      pengguna/                -- atur role & unit kerja (admin)
    api/
      laporan/pdf/            -- generator PDF (pengajuan/kategori/unit)
      ping/                    -- keepalive Supabase
  components/               -- UI primitives + komponen bersama (stage tracker, dst)
  lib/
    supabase/               -- client browser/server + session refresh
    types.ts                 -- semua tipe TS, cerminan skema database
    permissions.ts            -- pengecekan role di server
    pdf/                       -- layout & styling dokumen PDF
  proxy.ts                  -- gerbang autentikasi (nama baru middleware.ts di Next 16)
```

## Peran & Kewenangan

| Peran | Bisa mengajukan | Bertindak di tahap |
|---|---|---|
| Pemohon | ✅ | — (hanya bisa batalkan pengajuan sendiri) |
| Staf Logistik | ✅ | MAT-002 (Verifikasi), MAT-003 (Pemrosesan) |
| Pimpinan | ✅ | MAT-004 (Persetujuan Akhir) |
| Admin | ✅ | Semua tahap + kelola data master & pengguna |

Akun baru yang mendaftar otomatis berperan **Pemohon** dan belum terhubung
ke Unit Kerja — Admin perlu melengkapi unit kerja & (kalau perlu) menaikkan
role lewat halaman **Pengguna**.

## Yang Belum Dibangun (roadmap lanjutan)

Fondasi (skema, auth, alur MAT-001–004, pemenuhan sebagian, klasifikasi
barang, laporan+PDF) sudah jalan penuh dan sudah lolos `npm run build`
tanpa error. Beberapa hal ini masih bisa ditambahkan kalau ada waktu:

- Notifikasi email tiap perpindahan tahap (Supabase punya slot buat ini,
  tinggal pasang provider seperti Resend).
- Upload lampiran/dokumen pendukung per pengajuan (Supabase Storage sudah
  aktif di project, tinggal bikin bucket + form upload).
- Filter tanggal & pencarian teks di halaman Laporan & daftar Pengajuan.
- Tambah/hapus baris barang pada pengajuan yang masih di tahap MAT-001
  (sekarang barang hanya bisa diisi saat pembuatan awal — jumlahnya baru
  bisa disesuaikan mulai MAT-002).
- Endpoint publik buat modul Inventaris Rektorat "mendengar" data
  `inventaris_masuk` secara real-time (sekarang integrasinya konseptual,
  masing-masing aplikasi tetap standalone sesuai instruksi tugas).

## Kredit Desain

Palet warna, tipografi (Space Grotesk/Inter/JetBrains Mono), dan pola token
(`bg-surface`, `text-ink-muted`, dst) disamakan dengan proyek SIMBA supaya
konsisten sebagai satu ekosistem sistem informasi STT Mandala.
