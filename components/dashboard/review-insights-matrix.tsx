"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NormalizedReview } from "@/lib/adapters/gbp-interface";
import {
  Star,
  MessageSquare,
  ThumbsUp,
  AlertTriangle,
  CornerDownRight,
  Filter,
  CheckCircle2,
  Info,
} from "lucide-react";

export interface ReviewInsightsMatrixProps {
  reviews: NormalizedReview[];
}

export function ReviewInsightsMatrix({ reviews }: ReviewInsightsMatrixProps) {
  const [filter, setFilter] = React.useState<"all" | "positive" | "critical" | "unreplied">("all");

  const totalReviews = reviews.length;

  if (totalReviews === 0) {
    return (
      <Card className="border border-paper-300 shadow-editorial bg-white overflow-hidden">
        <CardHeader className="bg-paper-50/70 border-b border-paper-200 py-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-500 font-mono">
                Reputation & Customer Sentiment
              </span>
              <Badge variant="neutral" size="sm">
                0 Reviews Available
              </Badge>
            </div>
            <CardTitle className="text-lg font-semibold text-charcoal-950 pt-0.5">
              Customer Review Insights Matrix
            </CardTitle>
          </div>
          <Badge variant="outline" size="sm" className="bg-amber-50 text-amber-800 border-amber-300">
            Reviews Dimension: Not Evaluated
          </Badge>
        </CardHeader>

        <CardContent className="p-8 text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-paper-100 border border-paper-300 flex items-center justify-center mx-auto text-charcoal-400">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h4 className="text-base font-semibold text-charcoal-900">
              No Review Data Available
            </h4>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Review sentiment, average rating, and owner response rates require authentic review records. Branvidia will not calculate false sentiment metrics or invent a response rate when no reviews exist.
            </p>
            <p className="text-[11px] text-charcoal-500 bg-paper-100 p-3 rounded-lg border border-paper-200">
              <strong>Scoring Notice:</strong> Your 100-point optimization score will not be penalized for missing review records. The score will be normalized across Profile Completeness, Media Distribution, and Local SEO.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const averageRating = (
    reviews.reduce((acc, r) => acc + r.starRating, 0) / totalReviews
  ).toFixed(1);

  const starCounts = {
    5: reviews.filter((r) => r.starRating === 5).length,
    4: reviews.filter((r) => r.starRating === 4).length,
    3: reviews.filter((r) => r.starRating === 3).length,
    2: reviews.filter((r) => r.starRating === 2).length,
    1: reviews.filter((r) => r.starRating === 1).length,
  };

  const repliedCount = reviews.filter((r) => !!r.reviewReply).length;
  const unrepliedCount = totalReviews - repliedCount;
  const responseRate = Math.round((repliedCount / totalReviews) * 100);

  const filteredReviews = reviews.filter((r) => {
    if (filter === "positive") return r.starRating >= 4;
    if (filter === "critical") return r.starRating <= 3;
    if (filter === "unreplied") return !r.reviewReply;
    return true;
  });

  // Source provenance
  const sourceTypes = Array.from(new Set(reviews.map((r) => r.source || "SIMULATED_DEMO")));
  const primarySource = sourceTypes[0];

  return (
    <Card className="border border-paper-300 shadow-editorial bg-white overflow-hidden">
      <CardHeader className="bg-paper-50/70 border-b border-paper-200 py-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-500 font-mono">
              Reputation & Customer Sentiment
            </span>
            <Badge
              variant={
                primarySource === "LIVE_GOOGLE"
                  ? "live"
                  : primarySource === "CUSTOMER_PROVIDED"
                  ? "brand"
                  : "demo"
              }
              size="sm"
            >
              {primarySource === "LIVE_GOOGLE"
                ? "Live Google Reviews"
                : primarySource === "CUSTOMER_PROVIDED"
                ? "Customer-Provided Reviews"
                : "Sample Demonstration Reviews"}
            </Badge>
          </div>
          <CardTitle className="text-lg font-semibold text-charcoal-950 pt-0.5">
            Customer Review Insights Matrix
          </CardTitle>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-charcoal-500">Response Rate:</span>
          <Badge variant={responseRate >= 80 ? "success" : "warning"} size="sm" dot>
            {responseRate}% ({repliedCount}/{totalReviews} Replied)
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6 text-xs">
        {/* Rating Breakdown Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-paper-50 rounded-xl border border-paper-200/90 items-center">
          {/* Average Rating Block */}
          <div className="text-center md:border-r border-paper-200 md:pr-6 space-y-1">
            <div className="text-4xl font-bold tracking-tight text-charcoal-950 font-sans">
              {averageRating}
            </div>
            <div className="flex items-center justify-center gap-1 text-amber-500">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 fill-current ${
                    star <= Math.round(Number(averageRating))
                      ? "text-amber-500"
                      : "text-paper-300"
                  }`}
                />
              ))}
            </div>
            <p className="text-[11px] text-charcoal-500">
              Based on {totalReviews} {primarySource === "CUSTOMER_PROVIDED" ? "customer-provided" : primarySource === "LIVE_GOOGLE" ? "live Google" : "simulated sample"} reviews
            </p>
          </div>

          {/* Star Distribution Bars */}
          <div className="md:col-span-2 space-y-1.5">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = starCounts[stars as keyof typeof starCounts];
              const pct = Math.round((count / totalReviews) * 100);

              return (
                <div key={stars} className="flex items-center gap-2 text-[11px]">
                  <span className="w-6 font-mono text-charcoal-600 font-medium">
                    {stars}★
                  </span>
                  <div className="flex-1 h-2 bg-paper-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        stars >= 4
                          ? "bg-emerald-600"
                          : stars === 3
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right font-mono text-charcoal-500">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-b border-paper-200 pb-3">
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-charcoal-400" />
            <span className="text-xs font-semibold text-charcoal-700">Filter By:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setFilter("all")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                filter === "all"
                  ? "bg-branvidia-900 text-white"
                  : "bg-paper-100 text-charcoal-700 hover:bg-paper-200"
              }`}
            >
              All ({totalReviews})
            </button>
            <button
              onClick={() => setFilter("positive")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                filter === "positive"
                  ? "bg-emerald-800 text-white"
                  : "bg-paper-100 text-charcoal-700 hover:bg-paper-200"
              }`}
            >
              Positive (4–5★)
            </button>
            <button
              onClick={() => setFilter("critical")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                filter === "critical"
                  ? "bg-rose-800 text-white"
                  : "bg-paper-100 text-charcoal-700 hover:bg-paper-200"
              }`}
            >
              Critical / Gaps (1–3★)
            </button>
            <button
              onClick={() => setFilter("unreplied")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                filter === "unreplied"
                  ? "bg-amber-800 text-white"
                  : "bg-paper-100 text-charcoal-700 hover:bg-paper-200"
              }`}
            >
              Unanswered ({unrepliedCount})
            </button>
          </div>
        </div>

        {/* Individual Reviews Stream */}
        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
          {filteredReviews.map((review) => {
            const hasReply = !!review.reviewReply;

            return (
              <div
                key={review.reviewId}
                className="p-3.5 bg-paper-50 rounded-xl border border-paper-200 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-charcoal-950 text-xs">
                        {review.authorName}
                      </span>
                      <div className="flex items-center text-amber-500">
                        {Array.from({ length: review.starRating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-current" />
                        ))}
                      </div>
                      <Badge variant="neutral" size="sm" className="text-[9px]">
                        {review.source === "CUSTOMER_PROVIDED"
                          ? "Customer Input"
                          : review.source === "LIVE_GOOGLE"
                          ? "Live Google"
                          : "Simulated Demo"}
                      </Badge>
                    </div>
                    <span className="text-[10px] text-charcoal-400 font-mono">
                      {new Date(review.createTime).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  {hasReply ? (
                    <Badge variant="success" size="sm">
                      Owner Replied
                    </Badge>
                  ) : (
                    <Badge variant="warning" size="sm">
                      Unreplied • Action Needed
                    </Badge>
                  )}
                </div>

                <p className="text-charcoal-800 leading-relaxed font-sans text-xs">
                  &ldquo;{review.comment}&rdquo;
                </p>

                {/* Owner Reply Block */}
                {review.reviewReply && (
                  <div className="mt-2 pl-3 border-l-2 border-branvidia-300 bg-white/70 p-2.5 rounded-r-lg text-[11px] space-y-1">
                    <div className="flex items-center gap-1 text-branvidia-900 font-medium font-mono text-[10px]">
                      <CornerDownRight className="h-3 w-3" />
                      <span>Owner Response</span>
                    </div>
                    <p className="text-charcoal-700 italic">
                      &ldquo;{review.reviewReply.comment}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
