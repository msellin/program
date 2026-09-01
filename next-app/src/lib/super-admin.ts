"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const SUPER_ADMIN_EMAILS = new Set<string>([
  "sellinmargus@gmail.com",
  "margus@dolmit.com",
  // test@terav.fit was here until 2026-09-01. It is the account used to check
  // what the app looks like, and admin rights made that check meaningless — it
  // saw the "+ Add alongside (admin)" button and could start DRAFT programs by
  // URL, which is precisely why the draft-catalog leak went unnoticed. A test
  // account has to be a normal account.
  // Persona harness admin personas — validate multi-track UI states.
  // Safe: test-prefix guard in setup-test-user.ts prevents these from
  // ever touching real accounts.
  "e2e-persona-multitrack@example.test",
]);

export function isSuperAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return SUPER_ADMIN_EMAILS.has(email.toLowerCase());
}

export function useIsSuperAdmin(): boolean {
  const [admin, setAdmin] = useState(false);
  useEffect(() => {
    const supabase = createClient();
    // getSession() reads the local session; getUser() is a network round-trip to
    // Supabase. This runs on Today (RunSlotCard) — since rest days started
    // mounting that card on 2026-08-31 it sits on the LCP path — to gate a
    // button whose allowlist is two hardcoded emails. Local is enough.
    void supabase.auth.getSession().then(({ data }) => {
      setAdmin(isSuperAdminEmail(data.session?.user?.email));
    });
  }, []);
  return admin;
}
