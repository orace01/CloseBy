import type { ReactNode } from "react";
import { CheckIcon } from "@/components/ui/icons";
import { cn } from "@/lib/format";

export const sectionX = "px-4 sm:px-8 lg:px-16";
export const paperShadow = "shadow-[0_1px_2px_rgba(18,17,15,0.06),0_24px_48px_-24px_rgba(18,17,15,0.25)]";

export function SectionHeading({
  eyebrow,
  title,
  accent,
  lead,
  titleId,
  dark = false,
}: {
  eyebrow?: string;
  title: string;
  accent?: string;
  lead?: ReactNode;
  titleId?: string;
  dark?: boolean;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-end lg:gap-16">
      <div className="flex flex-col gap-5">
        {eyebrow && (
          <p className={cn("font-mono text-[13px] tracking-[0.06em] uppercase", dark ? "text-night-muted" : "text-graphite")}>
            {eyebrow}
          </p>
        )}
        <h2
          id={titleId}
          className="font-condensed text-[clamp(44px,5.3vw,76px)] leading-[0.96] font-semibold tracking-[-0.045em] text-balance"
        >
          {title}
          {accent && (
            <>
              {" "}
              <span className="font-serif font-medium tracking-[-0.03em] italic">{accent}</span>
            </>
          )}
        </h2>
      </div>
      {lead && (
        <p className={cn("max-w-[520px] text-lg leading-[1.55] text-pretty sm:text-xl", dark ? "text-night-muted" : "text-graphite")}>
          {lead}
        </p>
      )}
    </div>
  );
}

export function CheckItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <li className={cn("flex items-center gap-2.5", className)}>
      <CheckIcon size={16} strokeWidth={2.4} className="shrink-0" />
      {children}
    </li>
  );
}

export function MarkerSquare({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("inline-block size-2.5 shrink-0 bg-marker shadow-[inset_0_0_0_1px_var(--color-ink)]", className)}
    />
  );
}
