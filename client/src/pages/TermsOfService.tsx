import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: `By accessing or using BlockPlane Metric ("the Service"), operated by Block Plane LLC and its parent organization Sylvie Suite ("BlockPlane," "we," "our"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Service.`,
  },
  {
    title: "2. Description of Service",
    body: `BlockPlane Metric is a material decision intelligence platform designed to help builders, contractors, architects, designers, and developers make informed building material choices based on embodied carbon data, regenerative impact scoring, lifecycle performance, and regional feasibility. The Service includes a materials database, scoring framework (LIS, RIS, CPI), comparison tools, AI-powered insights, Frontier materials library, and Benchmark 2000 reference standard, among other features.`,
  },
  {
    title: "3. User Data and Privacy",
    body: `You retain ownership of the specific project data and personal information you input into the Service. BlockPlane does not sell your personally identifiable information to third parties. By using the Service, you consent to the collection and processing of your data as described in these Terms and our Privacy Policy.`,
  },
  {
    title: "4. Aggregate and Anonymized Data",
    body: `By using the Service, you grant BlockPlane and its parent organization Sylvie Suite an irrevocable, perpetual, worldwide, royalty-free license to collect, retain, analyze, aggregate, and commercialize anonymized, non-personally-identifiable data derived from your use of the Service, including but not limited to: material selections, comparisons, and rejections; embodied carbon calculations and scoring queries; benchmark comparisons and design decisions; search and filter patterns within the materials database; Frontier material engagement and adoption signals; and workflow patterns and feature usage.\n\nThis anonymized aggregate data is the exclusive intellectual property of BlockPlane. You retain no ownership rights to anonymized aggregate data. BlockPlane may use, license, sell, or transfer this aggregated dataset to third parties, including but not limited to software platforms, construction technology companies, carbon market operators, policy organizations, and research institutions, at its sole discretion. BlockPlane will never sell or transfer data in a form that identifies you personally.`,
  },
  {
    title: "5. User Submissions and Feedback",
    body: `By submitting materials, flagging data, or providing feedback through the Service, you grant BlockPlane a perpetual, irrevocable, worldwide, royalty-free license to use, modify, incorporate, and distribute your submissions for any purpose, including improving the Service, expanding the materials database, and developing derivative works. You represent that your submissions do not infringe any third-party rights.`,
  },
  {
    title: "6. AI-Generated Content",
    body: `The Service uses artificial intelligence, including third-party AI services, to generate material insights, comparison analyses, and recommendations. AI-generated content is provided for informational purposes only and does not constitute professional engineering, architectural, environmental, or legal advice. BlockPlane makes no warranty regarding the accuracy, completeness, or fitness for purpose of AI-generated content. Users should independently verify all material data before making specification or procurement decisions.`,
  },
  {
    title: "7. Beta Program",
    body: `During the beta period, the Service or portions of it may be provided free of charge. BlockPlane reserves the right to modify, suspend, discontinue, or introduce pricing for any aspect of the Service at any time. We will provide reasonable notice of material changes where practicable.`,
  },
  {
    title: "8. Account Termination",
    body: `You may delete your account at any time by contacting BlockPlane. Upon account deletion: your personally identifiable information will be removed from active systems within 30 days; project data you have created will be deleted; anonymized aggregate data derived from your usage will be retained as it cannot be re-identified; material submissions and flags you have contributed may be retained in anonymized form. BlockPlane reserves the right to suspend or terminate accounts that violate these Terms.`,
  },
  {
    title: "9. Intellectual Property",
    body: `All software, algorithms, scoring frameworks (LIS, RIS, CPI, Benchmark 2000), interfaces, and original content comprising the Service are the exclusive property of BlockPlane or its licensors. You may not copy, reverse engineer, scrape, or redistribute any part of the Service without express written permission. Third-party EPD data accessed through the Service remains the property of its respective owners and is subject to their attribution requirements.`,
  },
  {
    title: "10. Disclaimer of Warranties",
    body: `The Service is provided "as is" and "as available" without warranties of any kind, express or implied. BlockPlane makes no guarantees regarding the accuracy, completeness, or currency of embodied carbon data, material scores, or AI-generated insights. Score confidence levels (Verified, Estimated, Unreviewed) are provided as guidance only. Users are responsible for independently verifying material data for professional or commercial use.`,
  },
  {
    title: "11. Limitation of Liability",
    body: `To the fullest extent permitted by applicable law, BlockPlane shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or business opportunities, arising from your use of or inability to use the Service, even if BlockPlane has been advised of the possibility of such damages.`,
  },
  {
    title: "12. Changes to Terms",
    body: `BlockPlane reserves the right to modify these Terms at any time. Material changes will be communicated via email or prominent notice on the Service. Continued use of the Service after the effective date of updated Terms constitutes acceptance of the revised Terms.`,
  },
  {
    title: "13. Governing Law",
    body: `These Terms are governed by the laws of the State of Michigan, without regard to conflict of law principles. Any disputes arising under these Terms shall be resolved in the courts of Grand Traverse County, Michigan.`,
  },
  {
    title: "14. Contact",
    body: `For questions about these Terms, please contact BlockPlane at: hello@blockplanemetric.com`,
  },
];

export default function TermsOfService() {
  return (
    <div className="min-h-screen px-4 py-16">
      <div className="mx-auto w-full max-w-2xl space-y-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">BlockPlane Metric — Terms of Service</h1>
          <p className="text-sm text-muted-foreground">Effective Date: May 2, 2026</p>
        </div>

        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.title} className="space-y-2">
              <h2 className="text-base font-semibold">{section.title}</h2>
              {section.body.split("\n\n").map((para, i) => (
                <p key={i} className="text-sm text-muted-foreground leading-relaxed">
                  {para}
                </p>
              ))}
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
