import * as React from "react";
import { Card } from "@/components/ui/card";
import { MessageSquareText, ShieldCheck, PieChart, Image, Zap, FileSpreadsheet } from "lucide-react";

export function ValuePropsSection() {
  const features = [
    {
      icon: <MessageSquareText className="h-5 w-5 text-branvidia-800" />,
      title: "Contextual AI Onboarding",
      description:
        "The Branvidia AI Advisor conducts a focused dialogue to grasp your target customers, signature offerings, and strategic business goals.",
    },
    {
      icon: <ShieldCheck className="h-5 w-5 text-emerald-700" />,
      title: "Explicit Consent & OAuth 2.0",
      description:
        "Read-only Google Business Profile integration with cryptographic PKCE state validation. Never stores passwords or unauthorized access tokens.",
    },
    {
      icon: <PieChart className="h-5 w-5 text-indigo-700" />,
      title: "Customer Review Intelligence",
      description:
        "Uncovers recurring praise themes, operational complaints, and calculates true owner response rates with automated AI reply suggestions.",
    },
    {
      icon: <Image className="h-5 w-5 text-amber-700" />,
      title: "Photo & Media Distribution Audit",
      description:
        "Separates deterministic metadata audits (exterior, interior, team, recency) from visual inspection to target high-impact visual gaps.",
    },
    {
      icon: <Zap className="h-5 w-5 text-rose-700" />,
      title: "Deterministic Scoring Engine",
      description:
        "Transparent 0–100 optimization rating based on documented point deductions, never arbitrary numbers invented by an LLM.",
    },
    {
      icon: <FileSpreadsheet className="h-5 w-5 text-charcoal-700" />,
      title: "Publication-Grade Executive Report",
      description:
        "Comprehensive 8-section audit report with prioritized next steps, evidence citations, and instant PDF print formatting.",
    },
  ];

  return (
    <section className="space-y-6 pt-8">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-charcoal-900">
          Engineered for Executive Rigor
        </h2>
        <p className="text-sm text-charcoal-600">
          Every audit insight connects directly to verified profile metadata and real customer sentiment.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature, idx) => (
          <Card key={idx} className="p-5 space-y-3 bg-white/90 border-paper-200 hover:border-paper-300 transition-all">
            <div className="h-9 w-9 rounded-lg bg-paper-100 flex items-center justify-center border border-paper-200">
              {feature.icon}
            </div>
            <h3 className="font-semibold text-charcoal-900 text-sm">{feature.title}</h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">{feature.description}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
