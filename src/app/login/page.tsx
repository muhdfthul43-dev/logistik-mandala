import Image from "next/image";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const redirectTo = next && next.startsWith("/") ? next : "/dashboard";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-4 py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="mb-8 flex flex-col items-center sm:mx-auto sm:w-full sm:max-w-md">
        <Image src="/logo-sttm.png" alt="Logo STT Mandala" width={56} height={56} className="mb-4" />
        <h2 className="text-center font-display text-2xl font-bold tracking-tight text-ink">
          Logistik Konstruksi
        </h2>
        <p className="mt-2 text-center text-sm text-ink-muted">
          Sekolah Tinggi Teknologi Mandala
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full sm:mx-auto sm:max-w-[400px]">
        <div className="rounded-2xl border border-surface-border bg-surface px-6 py-8 shadow-sm sm:px-10">
          <div className="mb-6">
            <h1 className="text-lg font-semibold text-ink">Masuk ke Sistem</h1>
            <p className="text-sm text-ink-muted">Silakan masukkan kredensial administrator Anda.</p>
          </div>
          <LoginForm redirectTo={redirectTo} />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8">
        <p className="text-center text-xs text-ink-muted">
          © {new Date().getFullYear()} STT Mandala — Modul Logistik Konstruksi Rektorat
        </p>
      </div>
    </div>
  );
}
