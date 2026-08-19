"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/useStore";
import { createClient } from "@/lib/supabase/client";
import { today } from "@/lib/utils";

/**
 * F7 (Batch 23) — shared Export + Delete actions used by both Profile
 * (during migration) and the new /account route. Keeps the destructive
 * plumbing single-sourced so the ConfirmSheet + Sentry breadcrumbs +
 * Supabase session-refresh flow stays consistent across both surfaces.
 */
export function useAccountActions() {
  const store = useStore((s) => s.store);
  const wipe = useStore((s) => s.wipe);
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const exportMyData = () => {
    const blob = new Blob([JSON.stringify(store, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `terav-data-${today()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const deleteAccount = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setDeleteError("Not signed in. Sign in first, then try again.");
        setDeleting(false);
        return;
      }
      const res = await fetch("/api/delete-account", {
        method: "DELETE",
        headers: { authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        setDeleteError(
          `Delete failed (${res.status}). ${text || "Try again in a moment."}`,
        );
        setDeleting(false);
        return;
      }
      wipe();
      await supabase.auth.signOut();
      router.replace("/sign-in");
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : String(e));
      setDeleting(false);
    }
  };

  return { exportMyData, deleteAccount, deleting, deleteError, setDeleteError };
}
