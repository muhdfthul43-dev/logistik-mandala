-- ============================================================================
-- Skema database — Sistem Logistik Mandala (Single Admin)
-- Sekolah Tinggi Teknologi Mandala
--
-- Cara pakai: Supabase Dashboard project kamu > SQL Editor > New query,
-- paste seluruh isi file ini, klik Run.
-- PENTING: Menjalankan script ini akan MENGHAPUS semua tabel lama.
-- ============================================================================

-- Bersihkan tabel-tabel lama jika ada
drop table if exists public.inventaris_masuk cascade;
drop table if exists public.riwayat_pengajuan cascade;
drop table if exists public.pengajuan_item cascade;
drop table if exists public.pengajuan cascade;
drop table if exists public.master_barang cascade;
drop table if exists public.kategori_barang cascade;
drop table if exists public.unit_kerja cascade;
drop table if exists public.profiles cascade;

-- Hapus tipe enum lama
drop type if exists public.aksi_riwayat cascade;
drop type if exists public.status_pengajuan cascade;
drop type if exists public.tahap_pengajuan cascade;
drop type if exists public.user_role cascade;
drop type if exists public.jenis_barang cascade;
drop type if exists public.status_bayar cascade;
drop type if exists public.mat_kode cascade;

create extension if not exists "uuid-ossp";

-- ----------------------------------------------------------------------------
-- ENUM TYPES
-- ----------------------------------------------------------------------------

create type public.jenis_barang as enum ('aset_tetap', 'habis_pakai');
create type public.mat_kode as enum ('MAT-001', 'MAT-002', 'MAT-003', 'MAT-004');

-- ----------------------------------------------------------------------------
-- TABEL
-- ----------------------------------------------------------------------------

-- profiles: nyimpen profil admin
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  created_at timestamptz not null default now()
);

-- master_barang: katalog barang simpel
create table public.master_barang (
  id uuid primary key default uuid_generate_v4(),
  kode_barang text not null unique,
  nama_barang text not null,
  satuan_default text not null default 'Pcs',
  jenis_barang_default public.jenis_barang not null default 'habis_pakai',
  aktif boolean not null default true,
  created_at timestamptz not null default now()
);

-- pengajuan: header dokumen (MAT)
create table public.pengajuan (
  id uuid primary key default uuid_generate_v4(),
  nomor_pengajuan text not null unique,
  mat_kode public.mat_kode not null default 'MAT-001',
  perihal text not null,
  catatan text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- pengajuan_item: detail barang per dokumen
create table public.pengajuan_item (
  id uuid primary key default uuid_generate_v4(),
  pengajuan_id uuid not null references public.pengajuan(id) on delete cascade,
  master_barang_id uuid references public.master_barang(id) on delete set null,
  kode_barang_manual text,
  jenis_pekerjaan text,
  nama_barang text not null,
  merk text,
  ukuran_volume text,
  satuan text not null,
  jenis_barang public.jenis_barang not null,
  jumlah_diajukan integer not null default 0,
  jumlah_terpenuhi integer default 0,
  tanggal_pengajuan date,
  tanggal_penerimaan date,
  keterangan text,
  created_at timestamptz not null default now()
);

create index pengajuan_mat_idx on public.pengajuan(mat_kode);
create index pengajuan_item_pengajuan_idx on public.pengajuan_item(pengajuan_id);
create index pengajuan_item_barang_idx on public.pengajuan_item(master_barang_id);

-- ----------------------------------------------------------------------------
-- TRIGGERS
-- ----------------------------------------------------------------------------

create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_pengajuan_updated_at
before update on public.pengajuan
for each row execute function public.touch_updated_at();

-- Auto-bikin baris profiles begitu ada user baru daftar lewat Supabase Auth (khusus ditambah via Dashboard Supabase)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (Semua akses dibatasi hanya untuk authenticated user)
-- ----------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.master_barang enable row level security;
alter table public.pengajuan enable row level security;
alter table public.pengajuan_item enable row level security;

-- Hanya authenticated user (Admin) yang bisa akses semuanya
create policy "allow all to authenticated profiles" on public.profiles for all to authenticated using (true) with check (true);
create policy "allow all to authenticated master" on public.master_barang for all to authenticated using (true) with check (true);
create policy "allow all to authenticated pengajuan" on public.pengajuan for all to authenticated using (true) with check (true);
create policy "allow all to authenticated item" on public.pengajuan_item for all to authenticated using (true) with check (true);

-- ----------------------------------------------------------------------------
-- SEED DATA AWAL (Contoh)
-- ----------------------------------------------------------------------------

insert into public.master_barang (kode_barang, nama_barang, satuan_default, jenis_barang_default) values
  ('BRG-001', 'Kertas HVS A4 80gr', 'Rim', 'habis_pakai'),
  ('BRG-002', 'Pulpen Hitam', 'Dus', 'habis_pakai'),
  ('BRG-003', 'Laptop Kerja Standar', 'Unit', 'aset_tetap'),
  ('BRG-004', 'Klip Binder 155', 'Kotak', 'habis_pakai');
