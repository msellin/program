import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The one card (D-03, design §5c). Filled surface, 1px soft line, r12, p-4.
 * The left accent bar means status only — green / amber / red — and never
 * decorates. Stack cards with `space-y-3` (12px gap).
 *
 * `flush` drops the padding for a card that holds an edge-to-edge list.
 * For a card that must be a <button> or <Link>, put `cardClass()` on it.
 */
export type CardStatus = "green" | "amber" | "red";

const STATUS: Record<CardStatus, string> = {
  green: "border-l-4 border-l-green",
  amber: "border-l-4 border-l-amber",
  red: "border-l-4 border-l-red",
};

export function cardClass({ status, flush }: { status?: CardStatus; flush?: boolean } = {}) {
  return cn("rounded-xl border border-line-soft bg-surface", !flush && "p-4", status && STATUS[status]);
}

type Props = {
  status?: CardStatus;
  flush?: boolean;
  as?: "div" | "section" | "article" | "li";
  className?: string;
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLElement>, "className" | "children">;

export function Card({ status, flush, as: Tag = "div", className, children, ...rest }: Props) {
  return (
    <Tag className={cn(cardClass({ status, flush }), className)} {...rest}>
      {children}
    </Tag>
  );
}
