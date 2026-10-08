import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sistem Logistik | STT Mandala",
  description: "Pengajuan, verifikasi, dan persetujuan kebutuhan barang Sekolah Tinggi Teknologi Mandala.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="font-sans antialiased">
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
