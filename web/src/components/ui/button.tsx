import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/format";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "marker" | "inverse";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-paper hover:bg-[#2c2b28]",
  secondary: "border border-line bg-paper text-ink hover:border-ink",
  ghost: "text-ink hover:bg-desk",
  danger: "bg-danger text-paper hover:bg-[#a9312a]",
  marker: "bg-marker text-ink hover:brightness-95",
  inverse: "bg-paper text-ink hover:bg-desk",
};

const sizes: Record<Size, string> = {
  sm: "h-10 gap-1.5 rounded-lg px-4 text-sm",
  md: "h-12 gap-2 rounded-[10px] px-5 text-base",
  lg: "h-14 gap-2.5 rounded-xl px-6 text-base",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
}) {
  return cn(
    "inline-flex items-center justify-center font-semibold whitespace-nowrap transition-colors",
    "disabled:cursor-not-allowed disabled:border-transparent disabled:bg-disabled disabled:text-paper",
    variants[variant],
    sizes[size],
    className,
  );
}

type StyleProps = { variant?: Variant; size?: Size };

export function Button({ variant, size, className, type = "button", ...props }: ComponentProps<"button"> & StyleProps) {
  return <button type={type} className={buttonClasses({ variant, size, className })} {...props} />;
}

export function ButtonLink({ variant, size, className, ...props }: ComponentProps<typeof Link> & StyleProps) {
  return <Link className={buttonClasses({ variant, size, className })} {...props} />;
}
