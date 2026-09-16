import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRightIcon } from "@/components/ui/icons";
import { cn } from "@/lib/format";
import type { CampaignStatus, DraftEmail } from "@/lib/types";
import { Fragment } from "react";

const widths = {
  lg: "max-w-[1104px]",
  md: "max-w-[784px]",
  sm: "max-w-[704px]",
};

export function PageContainer({
  children,
  size = "lg",
  className,
}: {
  children: ReactNode;
  size?: keyof typeof widths;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto flex w-full flex-col gap-10 px-4 pt-10 pb-20 sm:px-8 sm:pt-14", widths[size], className)}>
      {children}
    </div>
  );
}

export function PageTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h1 className={cn("text-4xl leading-none font-semibold tracking-[-0.035em] sm:text-[44px]", className)}>{children}</h1>
  );
}

const campaignStatus: Record<CampaignStatus, { label: string; text: string; dot: string }> = {
  running: { label: "En cours", text: "text-success", dot: "bg-success" },
  paused: { label: "En pause", text: "text-graphite", dot: "bg-graphite" },
  done: { label: "Terminée", text: "text-graphite", dot: "bg-disabled" },
};

export function CampaignStatusLabel({ status }: { status: CampaignStatus }) {
  const style = campaignStatus[status];
  return (
    <span className={cn("inline-flex items-center gap-2 text-sm font-semibold", style.text)}>
      <span className={cn("size-2 shrink-0 rounded-full", style.dot)} aria-hidden="true" />
      {style.label}
    </span>
  );
}

/** Renders a drafted email; text backed by a verified fact is highlighted. */
export function EmailBody({ draft, className }: { draft: DraftEmail; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-3.5 font-serif text-[19px] leading-[1.65]", className)}>
      {draft.paragraphs.map((paragraph, i) => (
        <p key={i} className="whitespace-pre-line">
          {paragraph.map((segment, j) =>
            segment.factId ? (
              <span key={j} className="hl">
                {segment.text}
              </span>
            ) : (
              <Fragment key={j}>{segment.text}</Fragment>
            ),
          )}
        </p>
      ))}
    </div>
  );
}

/** A single highlighted line that leads somewhere, e.g. "3 e-mails à relire". */
export function CalloutLink({ href, children, action }: { href: string; children: ReactNode; action: string }) {
  return (
    <Link
      href={href}
      className="flex min-h-19 items-center justify-between gap-4 rounded-xl bg-desk px-5 py-4 transition-colors hover:bg-desk-deep sm:px-7"
    >
      <span className="flex items-center gap-3.5 text-lg font-semibold sm:text-[19px]">
        <span className="size-3.5 shrink-0 bg-marker shadow-[inset_0_0_0_1px_var(--color-ink)]" aria-hidden="true" />
        {children}
      </span>
      <span className="flex shrink-0 items-center gap-2 font-semibold">
        {action} <ArrowRightIcon size={17} />
      </span>
    </Link>
  );
}
