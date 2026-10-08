import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTanggal(value: string | Date | null | undefined): string {
  if (!value) return "-";
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatTanggalWaktu(value: string | Date | null | undefined): string {
  if (!value) return "-";
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date) + " WIB";
}

export function formatRupiah(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatAngka(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("id-ID").format(value);
}

/** Jumlah yang benar-benar dipenuhi — pakai jumlah_disetujui kalau sudah
 * diproses, kalau belum (masih null) dianggap sama dengan jumlah diajukan. */
export function jumlahEfektif(item: { jumlah: number; jumlah_disetujui: number | null }): number {
  return item.jumlah_disetujui ?? item.jumlah;
}

/** Harga satuan yang dipakai buat estimasi nilai — utamakan harga_aktual
 * (hasil pengadaan nyata), fallback ke harga_estimasi katalog. */
export function hargaEfektif(item: {
  harga_aktual?: number | null;
  master_barang?: { harga_estimasi: number | null } | null;
}): number {
  return item.harga_aktual ?? item.master_barang?.harga_estimasi ?? 0;
}

/** True kalau item ini dipenuhi lebih sedikit dari yang diminta. */
export function adaKekurangan(item: { jumlah: number; jumlah_disetujui: number | null }): boolean {
  return item.jumlah_disetujui !== null && item.jumlah_disetujui < item.jumlah;
}
