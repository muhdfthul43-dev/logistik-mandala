"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, type AuthResult } from "./actions";

const initialState: AuthResult = { error: null };

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();

  const [loginState, loginAction, loginPending] = useActionState(async (_prev: AuthResult, formData: FormData) => {
    const result = await login(formData);
    if (!result.error) {
      router.replace(redirectTo);
      router.refresh();
    }
    return result;
  }, initialState);

  return (
    <div>
      <form action={loginAction} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="nama@sttmandala.ac.id" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Kata Sandi</Label>
          <Input id="password" name="password" type="password" required />
        </div>
        {loginState.error && <p className="text-sm text-bad">{loginState.error}</p>}
        <Button type="submit" className="w-full" disabled={loginPending}>
          {loginPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Masuk
        </Button>
      </form>
    </div>
  );
}
