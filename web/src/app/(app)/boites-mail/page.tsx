import type { Metadata } from "next";
import { Mailboxes } from "@/components/app/mailboxes";

export const metadata: Metadata = { title: "Boîtes mail" };

export default function MailboxesPage() {
  return <Mailboxes />;
}
