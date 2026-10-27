import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

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
        <div style={{ display: "flex", fontSize: 28, letterSpacing: 4, color: "#d09a68", textTransform: "uppercase" }}>
          {kicker}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 800, lineHeight: 1.05 }}>{title}</div>
          <div style={{ display: "flex", marginTop: 28, fontSize: 34, color: "rgba(255,255,255,0.7)" }}>{sub}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 30 }}>
          <div style={{ display: "flex", fontWeight: 800, letterSpacing: 2 }}>TERAV</div>
          <div style={{ display: "flex", color: "rgba(255,255,255,0.55)" }}>terav.fit · Free during the beta</div>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
