# Panduan Setup — Sistem Logistik STT Mandala

Panduan ini nganggep kamu belum pernah setup Supabase/Vercel sama sekali.
Ikutin urut dari atas, jangan skip. Total waktu ±20-30 menit.

Ditulis dengan asumsi Windows (VS Code + terminal PowerShell bawaan VS Code),
tapi langkah di Supabase/Vercel-nya sama persis di OS apa pun — cuma bagian
command terminal yang mungkin beda.

---

## 0. Yang Perlu Disiapkan Dulu

- **Node.js versi 20 ke atas.** Cek dengan buka terminal (PowerShell) lalu
  ketik:
  ```powershell
  node -v
  ```
  Kalau hasilnya di bawah `v20` atau muncul error "not recognized", download
  & install dulu dari [nodejs.org](https://nodejs.org) (pilih tombol **LTS**),
  install seperti biasa (Next, Next, Finish), lalu **tutup dan buka ulang**
  terminal/VS Code sebelum lanjut.
- **Akun GitHub** — buat gratis di [github.com](https://github.com) kalau
  belum punya (dipakai buat deploy ke Vercel nanti).
- **File `logistik-sttm.zip`** yang gw kasih — extract dulu ke folder mana
  saja yang gampang diinget, misalnya `D:\Project\logistik-sttm`. Klik kanan
  file zip-nya → **Extract All...** → pilih lokasi → Extract.

---

## 1. Bikin Project Supabase

1. Buka [supabase.com](https://supabase.com) → klik **Start your project**
   → sign in pakai akun GitHub (paling cepat).
2. Kalau ini pertama kali, kamu akan diminta bikin **Organization** dulu —
   pilih **Personal**, nama bebas (mis. "Hans"), klik **Create organization**.
3. Klik **New project**. Isi:
   - **Project name**: `logistik-sttm` (bebas, ini cuma label)
   - **Database Password**: klik **Generate a password**, lalu **copy &
     simpan** password ini di Notepad — bakal kepake kalau suatu saat perlu
     konek langsung ke database (tidak dipakai di langkah-langkah bawah ini,
     tapi tetap simpan buat jaga-jaga)
   - **Region**: pilih **Southeast Asia (Singapore)** biar paling cepat
     diakses dari Indonesia
4. Klik **Create new project**. Tunggu ±1-2 menit sambil Supabase nyiapin
   database-nya (ada animasi loading). Jangan tutup tab.

---

## 2. Jalankan Skema Database

1. Setelah project siap (masuk ke halaman dashboard project), lihat
   **sidebar kiri** — cari ikon yang namanya **SQL Editor** (ikon kayak
   `</>`), klik itu.
2. Klik tombol **New query** di kiri atas area editor.
3. Buka file `supabase/schema.sql` dari folder hasil extract zip tadi pakai
   Notepad/VS Code, **select all** (Ctrl+A) → **copy** (Ctrl+C).
4. Balik ke tab Supabase, klik di area kosong SQL editor, **paste**
   (Ctrl+V) — seluruh isi file harusnya masuk (ratusan baris).
5. Klik tombol **Run** di kanan bawah (atau tekan `Ctrl+Enter`).
6. Tunggu beberapa detik. Kalau berhasil, muncul **"Success. No rows
   returned"** di panel bawah. Ini artinya semua tabel, aturan keamanan, dan
   data master (kategori, unit kerja) udah kebuat.

   **Kalau muncul error merah:** kemungkinan besar ada bagian script yang
   ke-cut waktu copy-paste. Ulangi dari langkah 3, pastikan copy dari baris
   paling atas (`-- ====...`) sampai baris paling bawah file.

---

## 3. Matikan Verifikasi Email

Supaya akun yang baru daftar bisa langsung dipakai tanpa perlu klik link
konfirmasi di email (lebih praktis buat demo/sidang).

1. Sidebar kiri → **Authentication**.
2. Klik tab **Providers** (atau **Sign In / Providers**, tergantung versi
   dashboard).
3. Klik **Email** di daftar provider.
4. Cari toggle **Confirm email**, matikan (posisi off/abu-abu).
5. Klik **Save** di bagian bawah panel.

---

## 4. Ambil API Key

1. Sidebar kiri, paling bawah → ikon gerigi **Project Settings**.
2. Klik **API** (atau **API Keys**) di sub-menu.
3. Kamu akan lihat beberapa nilai — yang dibutuhkan cuma **dua**:
   - **Project URL** → bentuknya `https://xxxxxxxxxxxx.supabase.co`
   - **anon public** key (di bagian **Project API keys**) → string panjang
     dimulai `eyJ...`
4. **PENTING:** jangan pernah pakai/share key **`service_role`** (ada di
   halaman yang sama) — itu master key yang bisa bypass semua aturan
   keamanan. Yang dipakai project ini cuma `anon public`.
5. Copy dua nilai ini ke Notepad sementara, dipakai di langkah berikutnya.

---

## 5. Install & Jalankan di Komputer Kamu

1. Buka VS Code → **File → Open Folder** → pilih folder hasil extract tadi
   (mis. `D:\Project\logistik-sttm`).
2. Buka terminal di VS Code: menu **Terminal → New Terminal** (atau
   ``Ctrl+` ``). Pastikan posisi terminal ada di folder project itu.
3. Install semua dependency:
   ```powershell
   npm install
   ```
   Ini bakal jalan ±1-2 menit, download banyak package. Tunggu sampai
   selesai (kursor kembali ke prompt normal, tanpa error merah).
4. Bikin file env lokal — di terminal:
   ```powershell
   cp .env.example .env.local
   ```
   Kalau command itu error di terminal kamu (jarang terjadi di PowerShell,
   tapi kalau kamu pakai Command Prompt/cmd), pakai ini sebagai gantinya:
   ```cmd
   copy .env.example .env.local
   ```
   Atau paling gampang: buka folder project di File Explorer, copy-paste
   file `.env.example`, rename hasil copy-annya jadi `.env.local`.
5. Buka file `.env.local` yang baru dibuat itu di VS Code, isi jadi:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ....(anon key kamu tadi)
   ```
   Ganti dengan nilai asli dari langkah 4. Simpan (Ctrl+S).
6. Jalankan aplikasinya:
   ```powershell
   npm run dev
   ```
   Tunggu sampai muncul tulisan `Ready` dan alamat semacam
   `http://localhost:3000` di terminal.
7. Buka browser, ke `http://localhost:3000` — harusnya muncul halaman login
   Sistem Logistik dengan logo STT Mandala.

---

## 6. Daftar Akun Pertama & Jadikan Admin

1. Di halaman login, klik tab **Daftar**.
2. Isi Nama Lengkap, email bebas (tidak perlu email asli karena verifikasi
   udah dimatikan — bahkan `admin@test.com` juga boleh), password minimal 6
   karakter.
3. Klik **Daftar Akun** — otomatis masuk ke Dashboard. Tapi baru berperan
   **Pemohon** (menu Data Master & Pengguna belum kelihatan), karena semua
   akun baru defaultnya begitu.
4. Balik ke tab Supabase → **SQL Editor** → **New query**, jalankan (ganti
   nama sesuai yang kamu isi tadi):
   ```sql
   update public.profiles set role = 'admin' where full_name = 'Nama Kamu Saat Daftar';
   ```
   Klik **Run**.
5. Balik ke aplikasi, **refresh browser** (F5). Menu **Data Master** dan
   **Pengguna** sekarang harusnya muncul di sidebar kiri.
6. Buka menu **Pengguna**, atur **Unit Kerja** buat akunmu sendiri di situ
   (pilih salah satu dari dropdown) — tanpa ini, kamu belum bisa bikin
   pengajuan baru.

---

## 7. (Opsional) Isi Data Contoh

Biar ada beberapa pengajuan contoh buat dicoba-coba/demo, tanpa perlu isi
manual satu-satu:

1. Pastikan udah daftar minimal 1 akun (langkah 6).
2. Buka `supabase/seed-demo-data.sql` di VS Code, copy semua isinya.
3. Paste di **SQL Editor** Supabase (New query lagi), klik **Run**.
4. Refresh halaman **Pengajuan** di aplikasi — harusnya muncul 3 contoh
   pengajuan di tahap berbeda-beda.

---

## 8. Deploy ke Vercel

### 8a. Push ke GitHub

Kalau folder ini belum jadi repo Git, di terminal VS Code (masih di folder
project yang sama):

```powershell
git init
git add .
git commit -m "Setup awal Sistem Logistik"
```

Lalu bikin repo baru di [github.com/new](https://github.com/new) — kasih
nama (mis. `logistik-sttm`), **jangan** centang "Add README" (biar tidak
konflik), klik **Create repository**. Di halaman berikutnya, GitHub kasih
beberapa baris command — copy yang di bagian **"…or push an existing
repository from the command line"**, biasanya mirip ini (pakai punya kamu,
bukan contoh ini):

```powershell
git remote add origin https://github.com/USERNAME-KAMU/logistik-sttm.git
git branch -M main
git push -u origin main
```

Jalankan itu di terminal. Kalau diminta login, ikuti saja instruksinya
(biasanya buka browser buat authorize).

### 8b. Import di Vercel

1. Buka [vercel.com](https://vercel.com) → sign in pakai akun GitHub yang
   sama.
2. Klik **Add New...** → **Project**.
3. Cari repo `logistik-sttm` yang barusan di-push, klik **Import**.
4. Di bagian **Environment Variables**, tambahkan dua baris (Name lalu
   Value), sama persis kayak isi `.env.local` kamu:
   - `NEXT_PUBLIC_SUPABASE_URL` → Project URL Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → anon public key Supabase
5. Klik **Deploy**. Tunggu ±2 menit sampai selesai build.
6. Setelah selesai, Vercel kasih link semacam
   `https://logistik-sttm-xxxx.vercel.app` — itu link aplikasi kamu yang
   sudah live, bisa diakses siapa saja.

### 8c. Jaga Supabase Tetap Aktif

Supabase gratis auto-pause kalau 7 hari tidak ada aktivitas sama sekali.
Biar aman menjelang sidang:

1. Daftar gratis di [cron-job.org](https://cron-job.org).
2. Bikin cronjob baru, URL-nya: `https://link-vercel-kamu.vercel.app/api/ping`
3. Atur jadwal tiap 3-4 hari sekali.

---

## Troubleshooting Cepat

| Gejala | Kemungkinan Sebab & Solusi |
|---|---|
| `npm install` error `EACCES` atau permission | Jalankan terminal VS Code as biasa saja (jangan Run as Administrator), pastikan folder project bukan di lokasi terkunci sistem. |
| `npm run dev` jalan tapi browser blank/error Supabase | Cek lagi isi `.env.local` — pastikan tidak ada spasi nyasar, dan URL-nya diawali `https://` lengkap. Restart `npm run dev` (Ctrl+C lalu jalankan lagi) setiap habis ubah `.env.local`. |
| Login/Daftar muter terus tidak masuk-masuk | Cek langkah 3 (Confirm email) beneran udah off. Bisa juga cek tab **Authentication → Users** di Supabase, lihat apakah user-nya kebuat di sana. |
| Menu Data Master/Pengguna tidak muncul padahal udah di-set admin | Pastikan SQL update-nya cocok persis sama Nama Lengkap yang dipakai daftar (case-sensitive). Cek dengan `select full_name, role from public.profiles;` di SQL Editor. Setelah update, **refresh browser**, bukan cuma pindah halaman. |
| Tombol "Unduh PDF" gagal / halaman blank | Biasanya karena logo `public/logo-sttm.png` tidak ketemu saat build — pastikan file itu ada persis di folder `public/` (bukan kehapus/kepindah). |
| Vercel build gagal | Buka tab **Deployments** di Vercel, klik yang gagal, baca **Build Logs** — biasanya karena Environment Variables belum keisi/typo nama variabelnya. |
