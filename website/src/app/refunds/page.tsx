import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { legalUpdated, refundSections, site } from "@/lib/config";

export const metadata: Metadata = {
  title: `Refunds & Risk Disclaimer — ${site.name}`,
  description: "BPI refund policy and trading risk disclaimer.",
};

export default function RefundsPage() {
  return (
    <LegalPage
      title="Refunds & Risk Disclaimer"
      updated={legalUpdated}
      intro="Please read this before subscribing. It covers the risks of trading and how refunds work."
      sections={refundSections}
    />
  );
}
