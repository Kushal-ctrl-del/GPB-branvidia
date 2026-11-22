"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NormalizedMediaAsset } from "@/lib/adapters/gbp-interface";
import {
  Camera,
  Image,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sparkles,
  Maximize2,
  Users,
  Building2,
  Coffee,
} from "lucide-react";

export interface PhotoDistributionMatrixProps {
  media: NormalizedMediaAsset[];
}

export function PhotoDistributionMatrix({ media }: PhotoDistributionMatrixProps) {
  const totalPhotos = media.length;

  const categories = {
    PROFILE: media.filter((m) => m.category === "PROFILE"),
    COVER: media.filter((m) => m.category === "COVER"),
    INTERIOR: media.filter((m) => m.category === "INTERIOR"),
    EXTERIOR: media.filter((m) => m.category === "EXTERIOR"),
    PRODUCT_AND_FOOD: media.filter(
      (m) => m.category === "PRODUCT" || m.category === "FOOD_AND_DRINK"
    ),
    AT_WORK: media.filter((m) => m.category === "AT_WORK"),
    ADDITIONAL: media.filter((m) => m.category === "ADDITIONAL"),
  };

  const hasLogo = categories.PROFILE.length > 0;
  const hasCover = categories.COVER.length > 0;
  const interiorCount = categories.INTERIOR.length;
  const isInteriorLow = interiorCount < 3;

  return (
    <Card className="border border-paper-300 shadow-editorial bg-white overflow-hidden">
      <CardHeader className="bg-paper-50/70 border-b border-paper-200 py-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-500 font-mono">
              Visual Asset Inventory
            </span>
            <Badge variant="brand" size="sm">
              Tier 1: Deterministic Metadata Audit
            </Badge>
          </div>
          <CardTitle className="text-lg font-semibold text-charcoal-950 pt-0.5">
            Photo Distribution & Coverage Matrix
          </CardTitle>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={totalPhotos >= 10 ? "success" : "warning"} size="sm" dot>
            {totalPhotos} Ingested Media Assets
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6 text-xs">
        {/* Tier Notice & Ground Truth Boundary */}
        <div className="p-3.5 bg-paper-100 rounded-xl border border-paper-200 flex items-start gap-2.5 text-xs text-charcoal-700">
          <Sparkles className="h-4 w-4 text-branvidia-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-charcoal-900">
              Deterministic Metadata Audit vs. Visual AI Inspection:
            </span>
            <p className="text-[11px] text-charcoal-600 leading-relaxed">
              This inventory evaluates verified file metadata (categories, aspect ratios, upload timestamps). Visual inspection of aesthetic composition, lighting, and brand signage is performed separately in Tier 2 AI Analysis.
            </p>
          </div>
        </div>

        {/* Category Coverage Status Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {/* Logo */}
          <div className="p-3 bg-paper-50 rounded-lg border border-paper-200 text-center space-y-1">
            <span className="text-[10px] uppercase font-mono text-charcoal-500">Logo</span>
            <p className="text-base font-bold text-charcoal-950">
              {categories.PROFILE.length}
            </p>
            {hasLogo ? (
              <span className="text-[10px] text-emerald-700 font-medium flex items-center justify-center gap-0.5">
                <CheckCircle2 className="h-3 w-3" /> Verified
              </span>
            ) : (
              <span className="text-[10px] text-rose-700 font-medium">Missing</span>
            )}
          </div>

          {/* Cover Photo */}
          <div className="p-3 bg-paper-50 rounded-lg border border-paper-200 text-center space-y-1">
            <span className="text-[10px] uppercase font-mono text-charcoal-500">Cover</span>
            <p className="text-base font-bold text-charcoal-950">
              {categories.COVER.length}
            </p>
            {hasCover ? (
              <span className="text-[10px] text-emerald-700 font-medium flex items-center justify-center gap-0.5">
                <CheckCircle2 className="h-3 w-3" /> Verified
              </span>
            ) : (
              <span className="text-[10px] text-rose-700 font-medium">Missing</span>
            )}
          </div>

          {/* Interior Photos */}
          <div
            className={`p-3 rounded-lg border text-center space-y-1 ${
              isInteriorLow
                ? "bg-amber-50/70 border-amber-200"
                : "bg-paper-50 border-paper-200"
            }`}
          >
            <span className="text-[10px] uppercase font-mono text-charcoal-500">Interior</span>
            <p className="text-base font-bold text-charcoal-950">
              {interiorCount}
            </p>
            {isInteriorLow ? (
              <span className="text-[10px] text-amber-800 font-medium flex items-center justify-center gap-0.5">
                <AlertTriangle className="h-3 w-3" /> Low (Rec: 3+)
              </span>
            ) : (
              <span className="text-[10px] text-emerald-700 font-medium">Optimal</span>
            )}
          </div>

          {/* Exterior Photos */}
          <div className="p-3 bg-paper-50 rounded-lg border border-paper-200 text-center space-y-1">
            <span className="text-[10px] uppercase font-mono text-charcoal-500">Exterior</span>
            <p className="text-base font-bold text-charcoal-950">
              {categories.EXTERIOR.length}
            </p>
            <span className="text-[10px] text-emerald-700 font-medium">Street View</span>
          </div>

          {/* Products & Food */}
          <div className="p-3 bg-paper-50 rounded-lg border border-paper-200 text-center space-y-1">
            <span className="text-[10px] uppercase font-mono text-charcoal-500">Products</span>
            <p className="text-base font-bold text-charcoal-950">
              {categories.PRODUCT_AND_FOOD.length}
            </p>
            <span className="text-[10px] text-emerald-700 font-medium">Strong</span>
          </div>

          {/* Team / At Work */}
          <div className="p-3 bg-paper-50 rounded-lg border border-paper-200 text-center space-y-1">
            <span className="text-[10px] uppercase font-mono text-charcoal-500">Team</span>
            <p className="text-base font-bold text-charcoal-950">
              {categories.AT_WORK.length}
            </p>
            <span className="text-[10px] text-emerald-700 font-medium">Present</span>
          </div>
        </div>

        {/* Media Gallery Grid */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-charcoal-900 text-xs">
              Ingested Photo Gallery ({totalPhotos} Assets)
            </h4>
            <span className="text-[11px] text-charcoal-500 font-mono">
              Metadata Audit Preview
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {media.map((asset) => (
              <div
                key={asset.mediaId}
                className="group relative bg-paper-100 rounded-lg border border-paper-200 overflow-hidden shadow-subtle hover:border-paper-400 transition-all"
              >
                <div className="aspect-square w-full overflow-hidden bg-paper-200 relative">
                  <img
                    src={asset.googleUrl}
                    alt={asset.description || "Business asset"}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute top-1.5 left-1.5">
                    <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-black/70 text-white font-medium">
                      {asset.category}
                    </span>
                  </div>
                </div>

                <div className="p-2 space-y-1">
                  <p className="text-[11px] font-medium text-charcoal-900 truncate">
                    {asset.description || asset.category}
                  </p>
                  {asset.dimensions && (
                    <p className="font-mono text-[9px] text-charcoal-400">
                      {asset.dimensions.widthPixels} × {asset.dimensions.heightPixels} px
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
