import type { ReactNode } from "react";
import { AppBar } from "@/components/app/app-bar";
import { AppStoreProvider } from "@/lib/store";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AppStoreProvider>
      <div className="flex min-h-dvh flex-col bg-paper">
        <AppBar />
        <main className="flex flex-1 flex-col">{children}</main>
      </div>
    </AppStoreProvider>
  );
}
