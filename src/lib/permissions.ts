import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function requireUserOrRedirect() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    // Profil mungkin belum terbuat oleh trigger jika ada delay
    return { id: user.id, full_name: user.email?.split("@")[0] || "Admin" };
  }

  return profile;
}
