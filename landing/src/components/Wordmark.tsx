/**
 * Terav wordmark — clean caps set on the sans stack with a small bronze pip.
 * The pip nods at the "sharpening" metaphor without being literal (no blades,
 * no razors — dumb visual pun to avoid).
 */
export function Wordmark({ size = "sm" }: { size?: "sm" | "lg" }) {
  const text =
    size === "lg"
      ? "text-2xl tracking-[0.14em]"
      : "text-sm tracking-[0.22em]";
  return (
    <div className={`flex items-center gap-2 font-semibold ${text}`}>
      <span className="inline-block h-2 w-2 rounded-full bg-[var(--color-bronze)]" />
      <span className="text-[var(--color-strong)]">TERAV</span>
    </div>
  );
}
