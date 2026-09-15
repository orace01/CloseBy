import Link from "next/link";
import type { ReactNode } from "react";
import { Wordmark } from "@/components/ui/misc";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex h-18 items-center px-4 sm:px-14">
        <Link href="/" className="text-2xl" aria-label="CloseBy, page d’accueil">
          <Wordmark />
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 pb-18">{children}</main>
    </div>
  );
}
