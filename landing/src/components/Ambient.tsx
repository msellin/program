/**
 * Ambient background — three radial gradient blobs + subtle grid overlay.
 * Bronze warms the top, teal cools the middle, deep amber grounds the base.
 * Follows the box-ranking landing pattern but with the app's palette.
 */
export function Ambient() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="blob-drift absolute -top-40 left-1/2 h-[640px] w-[640px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(208,154,104,0.32),transparent_62%)] blur-3xl" />
      <div className="blob-drift absolute top-1/3 -right-40 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,rgba(127,196,208,0.22),transparent_65%)] blur-3xl" />
      <div className="blob-drift absolute bottom-0 left-0 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,rgba(166,122,74,0.18),transparent_65%)] blur-3xl" />
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
    </div>
  );
}
