import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next.js 16 mengganti middleware.ts -> proxy.ts (nama fungsi juga jadi
// `proxy`, bukan `middleware`). Ini gerbang autentikasi: refresh sesi
// Supabase di tiap request & redirect ke /login kalau belum login.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Jalan di semua path KECUALI file statis Next.js & aset gambar,
     * supaya proxy tidak perlu mengecek sesi untuk request semacam itu.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
