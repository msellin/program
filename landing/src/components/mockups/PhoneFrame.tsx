import type { ReactNode } from "react";

/**
 * A phone-shaped frame — no image asset, pure CSS. Rounded 44px corners like
 * an iPhone-16 area, with the app's actual background (#0e0f12) inside.
 * The status bar row (time · signal · battery) sells "this is the real app"
 * without asking anyone to trust a PNG.
 */
export function PhoneFrame({
  children,
  label,
}: {
  children: ReactNode;
  label?: string;
}) {
  return (
    <div className="relative mx-auto w-full max-w-[340px] select-none">
      {label ? (
        <div className="mono-caps mb-3 text-center">{label}</div>
      ) : null}
      <div className="relative rounded-[44px] border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-2 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)]">
        <div className="relative overflow-hidden rounded-[36px] border border-white/[0.08] bg-[#0e0f12]">
          {/* Status bar */}
          <div className="flex items-center justify-between px-6 py-2.5 text-[10px] font-medium text-white/60">
            <span>9:41</span>
            <div className="flex items-center gap-1">
              {/* Neutral dot — was bronze, but the app's Stethoscope button is
                  muted/ink not bronze, so a bronze dot in the mockup was
                  over-promising the app's actual visual identity per the
                  landing↔app parity audit. Kept muted to stay honest. */}
              <span className="inline-block h-2 w-2 rounded-full bg-white/40" />
              <span>Terav</span>
            </div>
            <span>100</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
