import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

// The generated brand wordmark (dev/scripts/brand/build-brand-assets.mjs),
// inlined so the card is rendered at build time with no network fetch.
const WORDMARK = `data:image/svg+xml;base64,${fs.readFileSync(path.join(process.cwd(), "public/wordmark.svg")).toString("base64")}`;

/** Shared card for link previews and ads: kicker, headline, wordmark. */
export function ogCard({ kicker, title, sub }: { kicker: string; title: string; sub: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0e0f12",
          color: "#ffffff",
          padding: 72,
        }}
      >
        <div style={{ display: "flex", fontSize: 28, letterSpacing: 4, color: "#c89666", textTransform: "uppercase" }}>
          {kicker}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 800, lineHeight: 1.05 }}>{title}</div>
          <div style={{ display: "flex", marginTop: 28, fontSize: 34, color: "rgba(255,255,255,0.7)" }}>{sub}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 30 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- satori renders <img>, not next/image */}
          <img src={WORDMARK} alt="Terav" height={40} width={156} />
          <div style={{ display: "flex", color: "rgba(255,255,255,0.55)" }}>terav.fit · Free during the beta</div>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
