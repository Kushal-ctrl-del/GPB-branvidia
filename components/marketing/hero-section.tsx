import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Shield, BarChart3, Star, CheckCircle2 } from "lucide-react";

export function HeroSection() {
  return (
    <section className="text-center max-w-4xl mx-auto space-y-6 pt-4 pb-2">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Badge variant="brand" dot size="sm">
          Branvidia Intelligence Platform
        </Badge>
        <Badge variant="neutral" size="sm">
          Google Business Profile Optimization Engine
        </Badge>
      </div>

      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-charcoal-950 font-sans leading-[1.12]">
        Transform Your Google Business Presence with{" "}
        <span className="text-branvidia-900 underline decoration-branvidia-300 decoration-4 underline-offset-4">
          Evidence-Based AI
        </span>
      </h1>

      <p className="text-base sm:text-lg text-charcoal-600 max-w-2xl mx-auto leading-relaxed font-sans">
        Discover hidden revenue opportunities, diagnose profile gaps, analyze customer sentiment across all reviews, and optimize your local search authority with transparent, deterministic scoring.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs text-charcoal-500 font-medium">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>Deterministic 100-Pt Audit</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Shield className="h-4 w-4 text-branvidia-700" />
          <span>Zero Credential Retention</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Star className="h-4 w-4 text-amber-500" />
          <span>Sentiment Clustering</span>
        </div>
        <div className="flex items-center gap-1.5">
          <BarChart3 className="h-4 w-4 text-charcoal-700" />
          <span>Actionable Executive Dossier</span>
        </div>
      </div>
    </section>
  );
}
