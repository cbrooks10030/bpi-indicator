import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { legalUpdated, privacySections, site } from "@/lib/config";

export const metadata: Metadata = {
  title: `Privacy Policy — ${site.name}`,
  description: "How BPI collects, uses and protects your information.",
};

export default function PrivacyPage() {
  return <LegalPage title="Privacy Policy" updated={legalUpdated} sections={privacySections} />;
}
