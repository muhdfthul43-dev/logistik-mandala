import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Dipakai di Server Components, Server Actions, dan Route Handlers.
// Perlu di-await karena Next.js 16 bikin cookies() async.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Dipanggil dari Server Component (bukan Server Action/Route
            // Handler) — session refresh tetap ditangani oleh proxy.ts,
            // jadi aman diabaikan di sini.
          }
        },
      },
    }
  );
}
