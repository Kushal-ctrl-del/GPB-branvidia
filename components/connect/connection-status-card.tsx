"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NormalizedBusinessProfile } from "@/lib/types/contracts";
import {
  CheckCircle2,
  Building,
  MapPin,
  Tag,
  Star,
  Camera,
  MessageSquare,
  ArrowRight,
  LogOut,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

export interface ConnectionStatusCardProps {
  profile: NormalizedBusinessProfile;
  reviewsCount: number;
  photosCount: number;
  onProceedToAudit: () => void;
  onDisconnect: () => void;
  isLoading?: boolean;
}

export function ConnectionStatusCard({
  profile,
  reviewsCount,
  photosCount,
  onProceedToAudit,
  onDisconnect,
  isLoading = false,
}: ConnectionStatusCardProps) {
  const isLive = profile.dataSource === "LIVE_GOOGLE";
  const isCustomer = profile.dataSource === "CUSTOMER_PROVIDED";
  const repliedCount = reviewsCount > 0 ? Math.round((profile.metrics.responseRatePercent / 100) * reviewsCount) : 0;

  return (
    <Card className="border border-paper-300 shadow-editorial bg-white max-w-3xl mx-auto overflow-hidden">
      <CardHeader className="bg-paper-50/70 border-b border-paper-200 py-5 px-6 sm:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge
              variant={isLive ? "live" : isCustomer ? "brand" : "demo"}
              size="sm"
              dot
            >
              {isLive
                ? "Connected via Live Google OAuth"
                : isCustomer
                ? "Customer-Provided Business Assets"
                : "Connected via Demo Profile"}
            </Badge>
            <Badge variant="brand" size="sm">
              Step 5 Complete: Ingested
            </Badge>
          </div>
          <CardTitle className="text-xl font-semibold text-charcoal-950 pt-1">
            {isCustomer ? "Business Assets & Data Ingested" : "Google Business Profile Successfully Accessed"}
          </CardTitle>
          <CardDescription className="text-xs text-charcoal-600">
            Profile metadata, customer reviews, and photo records ingested into memory for analysis.
          </CardDescription>
        </div>

        <Button
          variant="outline"
          size="sm"
          leftIcon={<LogOut className="h-3.5 w-3.5" />}
          onClick={onDisconnect}
          title="Disconnect Profile"
        >
          Disconnect
        </Button>
      </CardHeader>

      <CardContent className="p-6 sm:p-8 space-y-6">
        {/* Profile Identity Bar */}
        <div className="p-4 bg-paper-100 rounded-xl border border-paper-200 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h4 className="text-lg font-bold text-charcoal-950 flex items-center gap-2">
                <Building className="h-5 w-5 text-branvidia-800 shrink-0" />
                <span>{profile.name}</span>
              </h4>
              <p className="text-xs text-charcoal-600 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-charcoal-400 shrink-0" />
                <span>
                  {profile.address.street
                    ? `${profile.address.street}, ${profile.address.city}, ${profile.address.state || ""} ${profile.address.country}`
                    : `${profile.address.city}, ${profile.address.country}`}
                </span>
              </p>
            </div>

            <div className="text-right">
              <span className="font-mono text-[11px] text-charcoal-500 bg-white px-2 py-0.5 rounded border border-paper-200">
                ID: {profile.locationId}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-paper-200/80">
            <Badge variant="neutral" size="sm">
              Category: {profile.primaryCategory}
            </Badge>
            {profile.additionalCategories.map((cat) => (
              <Badge key={cat} variant="neutral" size="sm">
                + {cat}
              </Badge>
            ))}
          </div>
        </div>

        {/* Ingested Assets Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
          <div className="p-3.5 bg-paper-50 rounded-lg border border-paper-200 space-y-1">
            <div className="flex items-center gap-1.5 text-charcoal-500 font-medium">
              <Star className="h-4 w-4 text-amber-500" />
              <span>Reviews Ingested</span>
            </div>
            <p className="text-xl font-semibold text-charcoal-900 font-sans">
              {reviewsCount} <span className="text-xs font-normal text-charcoal-500">records</span>
            </p>
            <p className="text-[11px] text-charcoal-500">
              {reviewsCount > 0 ? `Avg Rating: ${profile.metrics.averageRating}★` : "No reviews provided"}
            </p>
          </div>

          <div className="p-3.5 bg-paper-50 rounded-lg border border-paper-200 space-y-1">
            <div className="flex items-center gap-1.5 text-charcoal-500 font-medium">
              <Camera className="h-4 w-4 text-emerald-600" />
              <span>Media Assets</span>
            </div>
            <p className="text-xl font-semibold text-charcoal-900 font-sans">
              {photosCount} <span className="text-xs font-normal text-charcoal-500">photos</span>
            </p>
            <p className="text-[11px] text-charcoal-500">Categorized & quality checked</p>
          </div>

          <div className="p-3.5 bg-paper-50 rounded-lg border border-paper-200 space-y-1">
            <div className="flex items-center gap-1.5 text-charcoal-500 font-medium">
              <MessageSquare className="h-4 w-4 text-branvidia-800" />
              <span>Response Rate</span>
            </div>
            <p className="text-xl font-semibold text-charcoal-900 font-sans">
              {reviewsCount > 0 ? `${profile.metrics.responseRatePercent}%` : "N/A"}
            </p>
            <p className="text-[11px] text-charcoal-500">
              {reviewsCount > 0 ? `${repliedCount} of ${reviewsCount} reviews replied` : "No review records"}
            </p>
          </div>
        </div>

        {/* Profile Missing Fields Banner */}
        {profile.missingFields.length > 0 && (
          <div className="p-3.5 bg-amber-50/70 rounded-lg border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1.5 w-full">
              <span className="font-semibold block">Observed Profile Gaps ({profile.missingFields.length}):</span>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {profile.missingFields.map((gap, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-100 text-amber-900 border border-amber-200"
                  >
                    {gap}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="bg-paper-100/70 border-t border-paper-200 py-4 px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-xs text-charcoal-500 font-mono">
          Ready for Profile, Review & Photo Audit
        </span>

        <Button
          variant="primary"
          size="lg"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="h-4 w-4" />}
          onClick={onProceedToAudit}
        >
          Begin Profile Audit (Step 6)
        </Button>
      </CardFooter>
    </Card>
  );
}
