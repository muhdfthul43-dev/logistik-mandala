import type { Metadata } from "next";
import { Toaster } from "sonner";
import NextTopLoader from 'nextjs-toploader';
import "./globals.css";

export const metadata: Metadata = {
  title: "Sistem Logistik | STT Mandala",
  description: "Pengajuan, verifikasi, dan persetujuan kebutuhan barang Sekolah Tinggi Teknologi Mandala.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="font-sans antialiased">
        <NextTopLoader color="#2563eb" showSpinner={true} shadow="0 0 10px #2563eb,0 0 5px #2563eb" />
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
