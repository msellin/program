import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The one button (launch sweep D-01, design §5a). Tan rectangle, r8, sentence
 * case. Three variants: primary (tan), secondary (outlined), tertiary (teal
 * text link). `size="lg"` is only for the thumb-zone CTA inside a session.
 * Pass `href` to render a Next <Link> with the same look.
 */
type Variant = "primary" | "secondary" | "tertiary";

type Props = {
  variant?: Variant;
  size?: "md" | "lg";
  block?: boolean;
  href?: string;
  children: ReactNode;
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors motion-reduce:transition-none " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-strong " +
  "disabled:opacity-40 disabled:cursor-not-allowed";

const VARIANT: Record<Variant, string> = {
  primary: "bg-bronze text-ground hover:bg-bronze-hover active:bg-bronze-active",
  secondary: "border border-line-strong text-ink hover:bg-surface",
  tertiary: "text-slate hover:underline font-medium",
};

export function Button({ variant = "primary", size = "md", block, href, className, children, ...rest }: Props) {
  const cls = cn(
    BASE,
    VARIANT[variant],
    variant === "tertiary" ? "min-h-[44px]" : size === "lg" ? "h-[60px] text-[17px]" : "h-12 px-5 text-[15px]",
    block && "w-full",
    className,
  );
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  );
}
