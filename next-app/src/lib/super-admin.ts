"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const SUPER_ADMIN_EMAILS = new Set<string>([
  "sellinmargus@gmail.com",
  "margus@dolmit.com",
  "test@terav.fit",
]);

export function isSuperAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return SUPER_ADMIN_EMAILS.has(email.toLowerCase());
}

export function useIsSuperAdmin(): boolean {
  const [admin, setAdmin] = useState(false);
  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data }) => {
      setAdmin(isSuperAdminEmail(data.user?.email));
    });
  }, []);
  return admin;
}
