"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useStore } from "@/lib/useStore";
import { storeSchema } from "@/lib/schemas";
import { today } from "@/lib/utils";
import type { Store } from "@/lib/schemas";

export default function DataPage() {
  const store = useStore((s) => s.store);
  const hydrated = useStore((s) => s.hydrated);
  const replace = useStore((s) => s.replaceStore);
  const wipe = useStore((s) => s.wipe);
  const [copyLabel, setCopyLabel] = useState("Copy to clipboard");
  const shareSupported =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  if (!hydrated) return <div className="mt-8 text-sm text-muted">Loading…</div>;

  const bytes = new Blob([JSON.stringify(store)]).size;
  const nLogs = Object.keys(store.logs).length;

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(store, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `program-log-${today()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(store, null, 2));
      setCopyLabel("Copied ✓");
      setTimeout(() => setCopyLabel("Copy to clipboard"), 1500);
    } catch (e) {
      alert("Clipboard copy failed: " + (e instanceof Error ? e.message : String(e)));
    }
  };

  const shareLog = async () => {
    const filename = `program-log-${today()}.json`;
    const text = JSON.stringify(store, null, 2);
    try {
      if ("canShare" in navigator && typeof (navigator as unknown as { canShare?: (d: unknown) => boolean }).canShare === "function") {
        const file = new File([text], filename, { type: "application/json" });
        // Some browsers accept file arrays for share
        const shareData = { files: [file], title: "Terav log", text: filename };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((navigator as any).canShare(shareData)) {
          await navigator.share(shareData);
          return;
        }
      }
      await navigator.share({ title: "Terav log", text });
    } catch (e) {
      if (e instanceof Error && e.name !== "AbortError") alert("Share failed: " + e.message);
    }
  };

  const importFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert(
        `File is ${(file.size / 1024 / 1024).toFixed(1)} MB — over the 5 MB safety limit.\n` +
          `localStorage quota is typically 5-10 MB total; import aborted to avoid silent quota failure.`,
      );
      return;
    }
    const rd = new FileReader();
    rd.onload = () => {
      try {
        const parsed = JSON.parse(String(rd.result));
        const result = storeSchema.safeParse(parsed);
        if (!result.success) {
          const first = result.error.issues[0];
          alert(
            `Import failed — file doesn't match schema.\n` +
              `First issue: ${first ? first.message + " at " + first.path.join(".") : "unknown"}.\n` +
              `Nothing changed.`,
          );
          return;
        }
        const ok = confirm(
          `Replace current log with imported file?\nCurrent: ${nLogs} days.\nImported: ${Object.keys(result.data.logs).length} days.\nTraining maxes: ${Object.keys(result.data.training_maxes).length}.`,
        );
        if (!ok) return;
        try {
          replace(result.data);
          alert("Import complete.");
        } catch (writeErr) {
          const msg = writeErr instanceof Error ? writeErr.message : String(writeErr);
          if (/quota/i.test(msg)) {
            alert(
              "Import failed — localStorage quota exceeded. Your current log was NOT replaced. Wipe first, then re-import.",
            );
          } else {
            alert("Import failed on save: " + msg);
          }
        }
      } catch (err) {
        alert("Import failed: " + (err instanceof Error ? err.message : String(err)));
      }
    };
    rd.readAsText(file);
  };

  return (
    <div className="space-y-6 pt-4">
      <div>
        <Link
          href="/profile"
          className="inline-flex items-center gap-1 text-[13px] text-slate hover:text-ink min-h-[36px]"
        >
          <ChevronLeft size={14} />
          Profile
        </Link>
      </div>
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Data &amp; privacy</h1>
        <p className="mt-1 text-sm text-muted">
          {nLogs} days · {(bytes / 1024).toFixed(1)} KB in local storage
        </p>
      </header>

      <section className="rounded border border-line bg-surface p-4 space-y-3">
        <p className="text-sm">
          <strong>Export</strong> — download or share your full training log as JSON.
          Useful for backup or handing off to a coach.
        </p>
        <div className="flex flex-wrap gap-2">
          {shareSupported ? (
            <button
              type="button"
              onClick={shareLog}
              className="px-3 py-2 border border-line rounded bg-surface hover:bg-line-soft text-sm"
            >
              Share
            </button>
          ) : null}
          <button
            type="button"
            onClick={downloadJson}
            className="px-3 py-2 border border-line rounded bg-surface hover:bg-line-soft text-sm"
          >
            Download JSON
          </button>
          <button
            type="button"
            onClick={copyToClipboard}
            className="px-3 py-2 border border-line rounded bg-surface hover:bg-line-soft text-sm"
          >
            {copyLabel}
          </button>
          <label className="px-3 py-2 border border-line rounded bg-surface hover:bg-line-soft text-sm cursor-pointer">
            Import JSON
            <input
              type="file"
              accept="application/json"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) importFile(f);
              }}
              className="hidden"
            />
          </label>
          <button
            type="button"
            onClick={() => {
              if (
                confirm(
                  "Wipe the local log completely? This clears exercises, symptoms, TMs, and stretch targets. Cannot be undone (export first).",
                )
              ) {
                wipe();
              }
            }}
            className="px-3 py-2 border border-red text-red rounded bg-surface hover:bg-red hover:text-surface transition-colors text-sm ml-auto"
          >
            Wipe local log
          </button>
        </div>
        <PasteImport onImported={() => setCopyLabel("Copy to clipboard")} currentLogCount={nLogs} onReplace={replace} />
        <p className="text-[12px] text-muted leading-relaxed">
          <strong>On mobile:</strong> tap <em>Share</em> → AirDrop / Messages / Files to save a
          backup.<br />
          Wiping affects only this browser — your synced data on the server is untouched.
        </p>
      </section>

    </div>
  );
}

function PasteImport({
  onImported,
  currentLogCount,
  onReplace,
}: {
  onImported: () => void;
  currentLogCount: number;
  onReplace: (next: Store) => void;
}) {
  const [text, setText] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const handleImport = () => {
    if (!text.trim()) {
      setMsg("Paste some JSON first.");
      return;
    }
    try {
      const parsed = JSON.parse(text);
      const result = storeSchema.safeParse(parsed);
      if (!result.success) {
        const first = result.error.issues[0];
        setMsg(
          `Doesn't match store schema. First issue: ${first ? first.message + " at " + first.path.join(".") : "unknown"}. Nothing changed.`,
        );
        return;
      }
      const ok = confirm(
        `Replace current log with pasted data?\nCurrent: ${currentLogCount} days.\nIncoming: ${Object.keys(result.data.logs).length} days.\nTraining maxes: ${Object.keys(result.data.training_maxes).length}.`,
      );
      if (!ok) return;
      try {
        onReplace(result.data);
        setText("");
        setMsg(`Imported ${Object.keys(result.data.logs).length} days.`);
        onImported();
      } catch (writeErr) {
        const m = writeErr instanceof Error ? writeErr.message : String(writeErr);
        setMsg(/quota/i.test(m) ? "localStorage quota exceeded. Nothing changed." : "Save failed: " + m);
      }
    } catch (e) {
      setMsg("Not valid JSON: " + (e instanceof Error ? e.message : String(e)));
    }
  };

  return (
    <div className="pt-2 border-t border-line-soft space-y-2">
      <p className="mono-caps">Or paste JSON</p>
      {currentLogCount > 0 ? (
        <p className="text-[12px] text-muted">
          Paste a JSON backup here to replace your current log. Useful for
          moving between devices before sync is complete.
        </p>
      ) : (
        <p className="text-[12px] text-muted">
          Paste a JSON backup here if you&apos;re moving from another device.
        </p>
      )}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder="Paste your program.log.v2 JSON here…"
        className="w-full font-mono text-[12px] px-2 py-2 border border-line rounded bg-surface focus:outline-none focus:ring-2 focus:ring-bronze/40 focus:border-bronze min-h-[64px] resize-vertical"
      />
      {msg ? (
        <p className={/imported|success/i.test(msg) ? "text-[12px] text-green" : "text-[12px] text-red"}>{msg}</p>
      ) : null}
      <button
        type="button"
        onClick={handleImport}
        disabled={!text.trim()}
        className="px-3 py-2 min-h-[44px] border border-bronze text-bronze rounded hover:bg-bronze hover:text-ground disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
      >
        Import pasted JSON
      </button>
    </div>
  );
}
