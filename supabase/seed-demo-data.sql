-- ============================================================================
-- Data contoh (opsional) — Sistem Logistik STT Mandala
--
-- Jalankan file ini SETELAH schema.sql, DAN setelah minimal 1 akun sudah
-- daftar lewat halaman /login (karena pengajuan butuh pemohon yang nyata).
-- Aman dijalankan ulang — pengajuan contoh dilewati kalau nomor_pengajuan
-- sudah ada.
-- ============================================================================

do $$
declare
  v_pemohon uuid;
  v_unit uuid;
  v_barang_kertas uuid;
  v_barang_laptop uuid;
  v_barang_kursi uuid;
  v_pengajuan_1 uuid;
  v_pengajuan_2 uuid;
  v_pengajuan_3 uuid;
  v_item_id uuid;
begin
  select id into v_pemohon from public.profiles order by created_at asc limit 1;

  if v_pemohon is null then
    raise notice 'Belum ada user terdaftar — daftar dulu lewat halaman /login, baru jalankan seed ini.';
    return;
  end if;

  select unit_kerja_id into v_unit from public.profiles where id = v_pemohon;
  if v_unit is null then
    select id into v_unit from public.unit_kerja where kode = 'BUS';
    update public.profiles set unit_kerja_id = v_unit where id = v_pemohon;
  end if;

  select id into v_barang_kertas from public.master_barang where nama = 'Kertas HVS A4 80gr';
  select id into v_barang_laptop from public.master_barang where nama = 'Laptop Kerja Standar';
  select id into v_barang_kursi from public.master_barang where nama = 'Kursi Kerja';

  -- Pengajuan 1: baru diajukan, masih di MAT-002 (menunggu verifikasi)
  if not exists (select 1 from public.pengajuan where nomor_pengajuan = 'PGJ-2026-0001') then
    insert into public.pengajuan (nomor_pengajuan, pemohon_id, unit_kerja_id, tahap_saat_ini, status, perihal, catatan_pemohon)
    values ('PGJ-2026-0001', v_pemohon, v_unit, 'MAT-002', 'berjalan', 'Kebutuhan ATK triwulan berjalan', 'Stok ATK unit menipis, mohon diproses.')
    returning id into v_pengajuan_1;

    insert into public.pengajuan_item (pengajuan_id, master_barang_id, jumlah) values
      (v_pengajuan_1, v_barang_kertas, 20);

    insert into public.riwayat_pengajuan (pengajuan_id, tahap, aksi, aktor_id, catatan) values
      (v_pengajuan_1, 'MAT-001', 'diajukan', v_pemohon, 'Pengajuan dibuat.');
  end if;

  -- Pengajuan 2: sudah di MAT-004, menunggu persetujuan akhir Pimpinan
  if not exists (select 1 from public.pengajuan where nomor_pengajuan = 'PGJ-2026-0002') then
    insert into public.pengajuan (nomor_pengajuan, pemohon_id, unit_kerja_id, tahap_saat_ini, status, perihal, catatan_pemohon)
    values ('PGJ-2026-0002', v_pemohon, v_unit, 'MAT-004', 'berjalan', 'Pengadaan laptop kerja unit baru', 'Untuk staf baru yang mulai bulan depan.')
    returning id into v_pengajuan_2;

    insert into public.pengajuan_item (pengajuan_id, master_barang_id, jumlah) values
      (v_pengajuan_2, v_barang_laptop, 1);

    insert into public.riwayat_pengajuan (pengajuan_id, tahap, aksi, aktor_id, catatan) values
      (v_pengajuan_2, 'MAT-001', 'diajukan', v_pemohon, 'Pengajuan dibuat.'),
      (v_pengajuan_2, 'MAT-002', 'diverifikasi', v_pemohon, 'Kebutuhan valid, diteruskan.'),
      (v_pengajuan_2, 'MAT-003', 'diproses', v_pemohon, 'Stok tidak tersedia, perlu pengadaan baru.');
  end if;

  -- Pengajuan 3: sudah selesai & disetujui, TAPI cuma terpenuhi sebagian
  -- (contoh kasus stok penjual terbatas) — ini yang jadi contoh fitur
  -- pemenuhan sebagian & harga aktual.
  if not exists (select 1 from public.pengajuan where nomor_pengajuan = 'PGJ-2026-0003') then
    insert into public.pengajuan (nomor_pengajuan, pemohon_id, unit_kerja_id, tahap_saat_ini, status, perihal, catatan_pemohon)
    values ('PGJ-2026-0003', v_pemohon, v_unit, 'MAT-004', 'disetujui', 'Kursi kerja tambahan ruang staf', 'Kursi lama sudah rusak berat.')
    returning id into v_pengajuan_3;

    insert into public.pengajuan_item (pengajuan_id, master_barang_id, jumlah, jumlah_disetujui, harga_aktual, keterangan_pemenuhan)
    values (v_pengajuan_3, v_barang_kursi, 5, 3, 680000, 'Stok penjual cuma tersedia 3 unit, sisa 2 unit menyusul bulan depan.')
    returning id into v_item_id;

    insert into public.riwayat_pengajuan (pengajuan_id, tahap, aksi, aktor_id, catatan) values
      (v_pengajuan_3, 'MAT-001', 'diajukan', v_pemohon, 'Pengajuan dibuat.'),
      (v_pengajuan_3, 'MAT-002', 'diverifikasi', v_pemohon, 'Disetujui, diteruskan ke pemrosesan.'),
      (v_pengajuan_3, 'MAT-003', 'diproses', v_pemohon, 'Stok penjual cuma 3 unit, sisanya menyusul.'),
      (v_pengajuan_3, 'MAT-004', 'disetujui', v_pemohon, 'Disetujui, dana tersedia untuk 3 unit.');

    insert into public.inventaris_masuk (pengajuan_id, pengajuan_item_id, master_barang_id, jumlah, harga_satuan)
    values (v_pengajuan_3, v_item_id, v_barang_kursi, 3, 680000);
  end if;

  raise notice 'Seed data pengajuan selesai dibuat untuk pemohon %', v_pemohon;
end $$;
