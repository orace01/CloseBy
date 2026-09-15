import type { ReactNode } from "react";
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
        <p key={i}>
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
