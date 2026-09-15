import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/format";
import type { ProspectStatus } from "@/lib/types";

export function Wordmark({ className, onDark = false }: { className?: string; onDark?: boolean }) {
  return (
    <span className={cn("font-bold tracking-[-0.03em]", className)}>
      Close<span className={cn("hl px-0.5", onDark && "text-ink")}>By</span>
    </span>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("font-mono text-[13px] tracking-[0.06em] text-graphite uppercase", className)}>{children}</span>
  );
}

export function TextField({
  label,
  id,
  className,
  ...props
}: ComponentProps<"input"> & { label: string; id: string }) {
  return (
    <label htmlFor={id} className="flex flex-col gap-2 text-sm font-semibold">
      {label}
      <input
        id={id}
        className={cn(
          "h-13 rounded-[10px] border-[1.5px] border-ink bg-paper px-4 text-base font-normal text-ink placeholder:text-graphite-soft",
          className,
        )}
        {...props}
      />
    </label>
  );
}

const statusStyles: Record<ProspectStatus, { label: string; text: string; dot: string }> = {
  to_review: { label: "À relire", text: "text-ink", dot: "bg-ink" },
  approved: { label: "Approuvé", text: "text-success", dot: "bg-success" },
  rejected: { label: "Rejeté", text: "text-danger", dot: "bg-danger" },
  sent: { label: "Envoyé", text: "text-graphite", dot: "bg-graphite" },
  replied: { label: "Répondu", text: "text-success", dot: "bg-success" },
  no_email: { label: "Sans e-mail", text: "text-graphite", dot: "bg-rule" },
  excluded: { label: "Exclu", text: "text-danger", dot: "bg-danger" },
};

export function StatusLabel({ status, className }: { status: ProspectStatus; className?: string }) {
  const style = statusStyles[status];
  return (
    <span className={cn("inline-flex items-center gap-2 text-sm font-semibold", style.text, className)}>
      <span className={cn("size-2 shrink-0 rounded-full", style.dot)} aria-hidden="true" />
      {style.label}
    </span>
  );
}

export function statusLabel(status: ProspectStatus) {
  return statusStyles[status].label;
}
