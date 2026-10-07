import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { legalUpdated, site, termsSections } from "@/lib/config";

export const metadata: Metadata = {
  title: `Terms of Service — ${site.name}`,
  description: "The terms governing use of the BPI Indicator.",
};

export default function TermsPage() {
  return <LegalPage title="Terms of Service" updated={legalUpdated} sections={termsSections} />;
}
