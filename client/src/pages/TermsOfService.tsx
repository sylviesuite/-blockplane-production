import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: `By accessing or using Block Plane ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.`,
  },
  {
    title: "2. Description of Service",
    body: "Block Plane is a materials analysis and embodied carbon assessment platform designed to help residential architects and designers make informed material decisions during early-stage concept work.",
  },
  {
    title: "3. User Data and Privacy",
    body: "You retain ownership of the specific project data you input into the Service. Block Plane does not sell your personally identifiable information to third parties.",
  },
  {
    title: "4. Aggregate and Anonymized Data",
    body: "By using the Service, you grant Block Plane and its parent company an irrevocable, perpetual, worldwide, royalty-free license to collect, retain, analyze, aggregate, and commercialize anonymized, non-personally-identifiable data derived from your use of the Service, including but not limited to material selections, embodied carbon calculations, design decisions, benchmark comparisons, and workflow patterns. This anonymized aggregate data is the exclusive property of Block Plane. You retain no ownership rights to anonymized aggregate data. Block Plane may use, license, sell, or transfer this data to third parties at its sole discretion.",
  },
  {
    title: "5. Beta Program",
    body: "During the beta period, the Service is provided free of charge. Block Plane reserves the right to modify, suspend, or discontinue any aspect of the Service at any time without notice.",
  },
  {
    title: "6. Intellectual Property",
    body: "All software, algorithms, interfaces, and content comprising the Service are the exclusive property of Block Plane. You may not copy, reverse engineer, or redistribute any part of the Service.",
  },
  {
    title: "7. Disclaimer of Warranties",
    body: 'The Service is provided "as is" without warranties of any kind. Block Plane makes no guarantees regarding accuracy of carbon calculations or suitability for any particular purpose.',
  },
  {
    title: "8. Limitation of Liability",
    body: "Block Plane shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service.",
  },
  {
    title: "9. Changes to Terms",
    body: "Block Plane reserves the right to modify these Terms at any time. Continued use of the Service constitutes acceptance of updated Terms.",
  },
  {
    title: "10. Governing Law",
    body: "These Terms are governed by the laws of the State of Michigan.",
  },
];

export default function TermsOfService() {
  return (
    <div className="min-h-screen px-4 py-16">
      <div className="mx-auto w-full max-w-2xl space-y-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Block Plane Terms of Service</h1>
          <p className="text-sm text-muted-foreground">Effective Date: May 2, 2026</p>
        </div>

        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.title} className="space-y-2">
              <h2 className="text-base font-semibold">{section.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{section.body}</p>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t">
          <Link href="/">
            <Button variant="outline" size="sm">Back to home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
