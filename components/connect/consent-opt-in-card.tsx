"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CustomerUploadedPhoto, CustomerReviewInput } from "@/lib/types/contracts";
import { PhotoUploadWorkspace } from "./photo-upload-workspace";
import { ReviewImportWorkspace } from "./review-import-workspace";
import {
  ShieldCheck,
  Lock,
  Eye,
  FileText,
  Star,
  Camera,
  ArrowRight,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Layers,
} from "lucide-react";

export interface ConsentOptInCardProps {
  businessName: string;
  onSelectDemo: () => void;
  onInitiateLiveOAuth: () => void;
  onDirectIntake: (
    photos: CustomerUploadedPhoto[],
    reviews: CustomerReviewInput[],
    noReviewsOptOut: boolean
  ) => void;
  isConnecting?: boolean;
  initialPhotos?: CustomerUploadedPhoto[];
  initialReviews?: CustomerReviewInput[];
}

export function ConsentOptInCard({
  businessName,
  onSelectDemo,
  onInitiateLiveOAuth,
  onDirectIntake,
  isConnecting = false,
  initialPhotos = [],
  initialReviews = [],
}: ConsentOptInCardProps) {
  const [hasConsented, setHasConsented] = React.useState(false);
  const [activePathway, setActivePathway] = React.useState<"options" | "direct_intake">("options");

  // Direct Intake state
  const [uploadedPhotos, setUploadedPhotos] = React.useState<CustomerUploadedPhoto[]>(initialPhotos);
  const [customerReviews, setCustomerReviews] = React.useState<CustomerReviewInput[]>(initialReviews);
  const [noReviewsOptOut, setNoReviewsOptOut] = React.useState(false);
  const [directTab, setDirectTab] = React.useState<"photos" | "reviews">("photos");

  const handleProceedDirect = () => {
    onDirectIntake(uploadedPhotos, customerReviews, noReviewsOptOut);
  };

  return (
    <Card className="border border-paper-300 shadow-editorial bg-white max-w-4xl mx-auto overflow-hidden">
      {/* Header */}
      <CardHeader className="bg-paper-50/70 border-b border-paper-200 py-6 px-6 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="brand" size="sm" dot>
                Step 4: Integration & Asset Intake
              </Badge>
              <Badge variant="neutral" size="sm">
                Google Scope: business.manage
              </Badge>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-semibold text-charcoal-950 pt-1">
              Data Connection for {businessName}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-charcoal-600">
              Choose how to provide your profile assets and reputation data for your optimization audit.
            </CardDescription>
          </div>

          {activePathway === "direct_intake" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setActivePathway("options")}
            >
              ← Back to Connection Options
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6 sm:p-8 space-y-6">
        {activePathway === "direct_intake" ? (
          /* Direct Owner Intake Area: Photos & Reviews */
          <div className="space-y-6">
            <div className="p-4 bg-paper-100 rounded-xl border border-paper-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold text-charcoal-950">
                  Direct Business Asset Workspace
                </h4>
                <p className="text-xs text-charcoal-600 mt-0.5">
                  Provide your genuine business photos and customer reviews. All records are tagged with <code className="bg-white px-1 py-0.5 rounded border border-paper-300 font-mono text-[10px]">CUSTOMER_PROVIDED</code> provenance.
                </p>
              </div>

              {/* Sub-tab Switcher */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setDirectTab("photos")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    directTab === "photos"
                      ? "bg-branvidia-900 text-white shadow-subtle"
                      : "bg-white border border-paper-300 text-charcoal-700 hover:bg-paper-200"
                  }`}
                >
                  <Camera className="h-3.5 w-3.5" />
                  <span>Photos ({uploadedPhotos.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDirectTab("reviews")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    directTab === "reviews"
                      ? "bg-branvidia-900 text-white shadow-subtle"
                      : "bg-white border border-paper-300 text-charcoal-700 hover:bg-paper-200"
                  }`}
                >
                  <Star className="h-3.5 w-3.5" />
                  <span>Reviews ({customerReviews.length})</span>
                </button>
              </div>
            </div>

            {directTab === "photos" ? (
              <PhotoUploadWorkspace
                photos={uploadedPhotos}
                onChange={setUploadedPhotos}
              />
            ) : (
              <ReviewImportWorkspace
                reviews={customerReviews}
                onChange={setCustomerReviews}
                noReviewsOptOut={noReviewsOptOut}
                onToggleNoReviews={setNoReviewsOptOut}
              />
            )}

            {/* Bottom Action Bar for Direct Intake */}
            <div className="p-4 bg-paper-50 rounded-xl border border-paper-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3">
              <div className="text-xs text-charcoal-600">
                <span>{uploadedPhotos.length} photo{uploadedPhotos.length === 1 ? "" : "s"}</span> •{" "}
                <span>
                  {noReviewsOptOut
                    ? "Review evaluation skipped (no penalty)"
                    : `${customerReviews.length} customer review${customerReviews.length === 1 ? "" : "s"}`}
                </span>
              </div>

              <Button
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="h-4 w-4" />}
                onClick={handleProceedDirect}
              >
                Ingest & Audit My Assets (Step 5)
              </Button>
            </div>
          </div>
        ) : (
          /* Pathway Selection Screen */
          <div className="space-y-6">
            {/* Google OAuth Scope & Intended Usage Disclosure */}
            <div className="p-4 bg-paper-100 rounded-xl border border-paper-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-700 font-mono">
                  OAuth Scope Disclosure: business.manage
                </span>
                <Badge variant="neutral" size="sm">Google Standard Scope</Badge>
              </div>
              <p className="text-xs text-charcoal-700 leading-relaxed">
                Google provides the <code className="px-1.5 py-0.5 bg-white rounded border border-paper-300 font-mono text-[11px]">business.manage</code> OAuth scope for accessing Business Profiles. While Google&apos;s permission name reflects management authority, <strong>Branvidia operates exclusively in read-only audit mode</strong>.
              </p>
              <p className="text-[11px] text-charcoal-600 leading-relaxed">
                Our platform only queries profile metadata, public reviews, and media to generate diagnostic recommendations. Branvidia will never alter your business hours, modify address details, post reviews, or write changes back to your profile.
              </p>
            </div>

            {/* Affirmative Consent Checkbox */}
            <div className="p-4 bg-branvidia-50/50 rounded-xl border border-branvidia-200/80 flex items-start gap-3">
              <input
                id="affirmative-consent"
                type="checkbox"
                checked={hasConsented}
                onChange={(e) => setHasConsented(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-branvidia-300 text-branvidia-800 focus:ring-branvidia-700 cursor-pointer"
              />
              <label
                htmlFor="affirmative-consent"
                className="text-xs text-charcoal-800 leading-snug cursor-pointer select-none font-medium"
              >
                I authorize Branvidia to access my Google Business Profile data under the Google <code className="px-1 py-0.5 bg-white rounded border border-branvidia-300 font-mono text-[10px]">business.manage</code> scope, acknowledging that Branvidia will operate in read-only audit mode to generate this optimization analysis.
              </label>
            </div>

            {/* 3 Clear Connection Pathways */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal-600">
                Select Your Connection Mode
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Pathway 1: Real Google OAuth */}
                <div
                  className={`p-5 rounded-xl border transition-all flex flex-col justify-between ${
                    hasConsented
                      ? "bg-white border-paper-300 hover:border-branvidia-700 hover:shadow-editorial"
                      : "bg-paper-100 border-paper-200 opacity-60 pointer-events-none"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-500 font-mono">
                        Mode 1
                      </span>
                      <Badge variant="live" size="sm" dot>
                        Live OAuth
                      </Badge>
                    </div>
                    <h5 className="font-semibold text-charcoal-900 text-sm">
                      Connect Live Google Account
                    </h5>
                    <p className="text-xs text-charcoal-600 leading-relaxed">
                      Redirects to Google Identity to authorize access to your genuine Google Business Profile locations.
                    </p>
                  </div>

                  <div className="pt-4">
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full text-xs"
                      disabled={!hasConsented || isConnecting}
                      isLoading={isConnecting}
                      rightIcon={<ExternalLink className="h-3.5 w-3.5" />}
                      onClick={onInitiateLiveOAuth}
                    >
                      Authorize Google
                    </Button>
                  </div>
                </div>

                {/* Pathway 2: Direct Asset & Review Input (No OAuth Needed) */}
                <div className="p-5 rounded-xl border bg-white border-branvidia-300 hover:border-branvidia-800 hover:shadow-editorial transition-all flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-500 font-mono">
                        Mode 2 (Owner)
                      </span>
                      <Badge variant="brand" size="sm" dot>
                        Direct Input
                      </Badge>
                    </div>
                    <h5 className="font-semibold text-charcoal-900 text-sm">
                      Upload Photos & Reviews
                    </h5>
                    <p className="text-xs text-charcoal-600 leading-relaxed">
                      Upload business images, paste or CSV-import your customer reviews, or audit without reviews.
                    </p>
                  </div>

                  <div className="pt-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full text-xs border-branvidia-300 bg-branvidia-50 text-branvidia-900 hover:bg-branvidia-100"
                      rightIcon={<Upload className="h-3.5 w-3.5" />}
                      onClick={() => setActivePathway("direct_intake")}
                    >
                      Provide My Assets
                    </Button>
                  </div>
                </div>

                {/* Pathway 3: Demo Mode */}
                <div className="p-5 rounded-xl border bg-white border-paper-300 hover:border-indigo-600 hover:shadow-editorial transition-all flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-500 font-mono">
                        Mode 3 (Demo)
                      </span>
                      <Badge variant="demo" size="sm" dot>
                        Sample Data
                      </Badge>
                    </div>
                    <h5 className="font-semibold text-charcoal-900 text-sm">
                      Explore with Demo Profile
                    </h5>
                    <p className="text-xs text-charcoal-600 leading-relaxed">
                      Instantly test with simulated Google profile data tailored to your selected business category.
                    </p>
                  </div>

                  <div className="pt-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full text-xs border-paper-300"
                      disabled={isConnecting}
                      rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                      onClick={onSelectDemo}
                    >
                      Use Demo Profile
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="bg-paper-100/70 border-t border-paper-200 py-3.5 px-6 sm:px-8 text-xs text-charcoal-500 flex items-center justify-between">
        <span className="font-mono text-[11px]">
          SCOPE: https://www.googleapis.com/auth/business.manage
        </span>
        <span className="text-charcoal-400">Step 4 of 10</span>
      </CardFooter>
    </Card>
  );
}
