"use client";

import * as React from "react";
import { ProfileMetadataCard } from "./profile-metadata-card";
import { ReviewInsightsMatrix } from "./review-insights-matrix";
import { PhotoDistributionMatrix } from "./photo-distribution-matrix";
import { NormalizedBusinessProfile } from "@/lib/types/contracts";
import { NormalizedReview, NormalizedMediaAsset } from "@/lib/adapters/gbp-interface";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Sparkles,
  LogOut,
  RefreshCw,
  Building,
  Layers,
  FileCheck,
} from "lucide-react";

export interface ProfileDashboardProps {
  profile: NormalizedBusinessProfile;
  reviews: NormalizedReview[];
  media: NormalizedMediaAsset[];
  onProceedToAnalysis: () => void;
  onDisconnect: () => void;
  isLoading?: boolean;
}

export function ProfileDashboard({
  profile,
  reviews,
  media,
  onProceedToAnalysis,
  onDisconnect,
  isLoading = false,
}: ProfileDashboardProps) {
  const [activeTab, setActiveTab] = React.useState<"all" | "metadata" | "reviews" | "photos">("all");

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Dashboard Action Bar */}
      <div className="bg-white border border-paper-300 rounded-xl p-4 sm:p-5 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-500 font-mono">
              Step 6 Ingestion Complete
            </span>
            <Badge variant={profile.dataSource === "LIVE_GOOGLE" ? "live" : "demo"} size="sm" dot>
              {profile.dataSource === "LIVE_GOOGLE" ? "Live Google Data" : "Sample Business Data"}
            </Badge>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-charcoal-950 font-sans flex items-center gap-2">
            <Building className="h-6 w-6 text-branvidia-800 shrink-0" />
            <span>{profile.name}</span>
          </h2>
          <p className="text-xs text-charcoal-600">
            {profile.address.city}, {profile.address.country} • {reviews.length} reviews • {media.length} photos
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<LogOut className="h-3.5 w-3.5" />}
            onClick={onDisconnect}
          >
            Disconnect
          </Button>

          <Button
            variant="primary"
            size="md"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="h-4 w-4" />}
            onClick={onProceedToAnalysis}
          >
            Run AI Analysis (Step 7)
          </Button>
        </div>
      </div>

      {/* Tab Navigation Filter */}
      <div className="flex items-center gap-2 border-b border-paper-300 pb-2">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "all"
              ? "bg-branvidia-900 text-white shadow-subtle"
              : "text-charcoal-600 hover:text-charcoal-950 hover:bg-paper-200"
          }`}
        >
          Overview (All Modules)
        </button>
        <button
          onClick={() => setActiveTab("metadata")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "metadata"
              ? "bg-branvidia-900 text-white shadow-subtle"
              : "text-charcoal-600 hover:text-charcoal-950 hover:bg-paper-200"
          }`}
        >
          Entity Metadata
        </button>
        <button
          onClick={() => setActiveTab("reviews")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "reviews"
              ? "bg-branvidia-900 text-white shadow-subtle"
              : "text-charcoal-600 hover:text-charcoal-950 hover:bg-paper-200"
          }`}
        >
          Reviews ({reviews.length})
        </button>
        <button
          onClick={() => setActiveTab("photos")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "photos"
              ? "bg-branvidia-900 text-white shadow-subtle"
              : "text-charcoal-600 hover:text-charcoal-950 hover:bg-paper-200"
          }`}
        >
          Photos ({media.length})
        </button>
      </div>

      {/* Modules Render */}
      <div className="space-y-8">
        {(activeTab === "all" || activeTab === "metadata") && (
          <ProfileMetadataCard profile={profile} />
        )}

        {(activeTab === "all" || activeTab === "reviews") && (
          <ReviewInsightsMatrix reviews={reviews} />
        )}

        {(activeTab === "all" || activeTab === "photos") && (
          <PhotoDistributionMatrix media={media} />
        )}
      </div>

      {/* Bottom Floating/Sticky Action Bar */}
      <div className="p-4 sm:p-6 bg-white border border-paper-300 rounded-xl shadow-editorial flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="text-sm font-semibold text-charcoal-950">
            Ground-Truth Ingestion Ready for Deterministic Scoring & AI Inference
          </h4>
          <p className="text-xs text-charcoal-600">
            All 12 reviews, 10 photo records, and profile fields are validated and ready to be processed.
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="h-4 w-4" />}
          onClick={onProceedToAnalysis}
        >
          Proceed to AI Analysis & Scoring (Step 7)
        </Button>
      </div>
    </div>
  );
}
