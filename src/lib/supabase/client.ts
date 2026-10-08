import { createBrowserClient } from "@supabase/ssr";

// Dipakai di Client Components ("use client"). Aman dipanggil berkali-kali —
// nilai env di sini publik (anon key), keamanan sesungguhnya ada di RLS.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
