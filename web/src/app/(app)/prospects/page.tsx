import type { Metadata } from "next";
import { ProspectsTable } from "@/components/app/prospects-table";

export const metadata: Metadata = { title: "Prospects" };

export default function ProspectsPage() {
  return <ProspectsTable />;
}
