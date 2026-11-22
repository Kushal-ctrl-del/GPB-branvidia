"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NormalizedBusinessProfile } from "@/lib/types/contracts";
import {
  Building,
  MapPin,
  Clock,
  Globe,
  Phone,
  FileText,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Layers,
} from "lucide-react";

export interface ProfileMetadataCardProps {
  profile: NormalizedBusinessProfile;
}

export function ProfileMetadataCard({ profile }: ProfileMetadataCardProps) {
  const isLive = profile.dataSource === "LIVE_GOOGLE";
  const descLength = profile.description?.length || 0;
  const isDescOptimal = descLength >= 250 && descLength <= 750;

  return (
    <Card className="border border-paper-300 shadow-editorial bg-white overflow-hidden">
      <CardHeader className="bg-paper-50/70 border-b border-paper-200 py-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-500 font-mono">
              Entity Metadata
            </span>
            <Badge variant={isLive ? "live" : "demo"} size="sm" dot>
              {isLive ? "Live GBP Ingestion" : "Demo Profile Ingestion"}
            </Badge>
          </div>
          <CardTitle className="text-lg font-semibold text-charcoal-950">
            {profile.name}
          </CardTitle>
          <CardDescription className="text-xs text-charcoal-600">
            Location ID: <span className="font-mono">{profile.locationId}</span>
          </CardDescription>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="brand" size="sm">
            Primary: {profile.primaryCategory}
          </Badge>
          {profile.additionalCategories.slice(0, 2).map((cat) => (
            <Badge key={cat} variant="neutral" size="sm">
              +{cat}
            </Badge>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6 text-xs">
        {/* Contact & Location Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Address & Phone */}
          <div className="p-4 bg-paper-50 rounded-xl border border-paper-200/90 space-y-3">
            <h4 className="font-semibold text-charcoal-900 flex items-center gap-2 text-xs">
              <MapPin className="h-4 w-4 text-branvidia-800" />
              <span>Location & Contact Information</span>
            </h4>

            <div className="space-y-2 text-charcoal-700">
              <div className="flex items-start justify-between gap-2">
                <span className="text-charcoal-500">Storefront Address:</span>
                <span className="font-medium text-right text-charcoal-900">
                  {profile.address.street || "No street provided"}, {profile.address.city},{" "}
                  {profile.address.state || ""} {profile.address.postalCode || ""},{" "}
                  {profile.address.country}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1 border-t border-paper-200/70">
                <span className="text-charcoal-500 flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  <span>Phone Number:</span>
                </span>
                <span className="font-mono text-charcoal-900">
                  {profile.phoneNumber || "None listed"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1 border-t border-paper-200/70">
                <span className="text-charcoal-500 flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5" />
                  <span>Website URL:</span>
                </span>
                {profile.websiteUrl ? (
                  <a
                    href={profile.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-branvidia-800 font-medium hover:underline flex items-center gap-1 font-mono text-[11px]"
                  >
                    <span>{profile.websiteUrl.replace(/^https?:\/\//, "")}</span>
                  </a>
                ) : (
                  <span className="font-semibold text-amber-700 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Missing (Critical Gap)
                  </span>
                )}
              </div>

              {/* Connected Social Profiles */}
              {profile.socialLinks && (profile.socialLinks.instagramUrl || profile.socialLinks.facebookUrl || profile.socialLinks.googleBusinessProfileUrl) && (
                <div className="pt-2 border-t border-paper-200/70 space-y-1">
                  <span className="text-[11px] text-charcoal-500 font-semibold uppercase tracking-wider block">Connected Links:</span>
                  <div className="flex flex-wrap gap-2 pt-0.5">
                    {profile.socialLinks.instagramUrl && (
                      <a
                        href={profile.socialLinks.instagramUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-rose-700 hover:underline bg-rose-50 px-2 py-0.5 rounded border border-rose-200"
                      >
                        Instagram ↗
                      </a>
                    )}
                    {profile.socialLinks.facebookUrl && (
                      <a
                        href={profile.socialLinks.facebookUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-blue-700 hover:underline bg-blue-50 px-2 py-0.5 rounded border border-blue-200"
                      >
                        Facebook ↗
                      </a>
                    )}
                    {profile.socialLinks.googleBusinessProfileUrl && (
                      <a
                        href={profile.socialLinks.googleBusinessProfileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-emerald-800 hover:underline bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
                      >
                        Google Map Link ↗
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description & Completeness */}
          <div className="p-4 bg-paper-50 rounded-xl border border-paper-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-charcoal-900 flex items-center gap-2 text-xs">
                <FileText className="h-4 w-4 text-branvidia-800" />
                <span>Business Description Audit</span>
              </h4>
              <span
                className={`font-mono text-[11px] px-1.5 py-0.5 rounded ${
                  isDescOptimal
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {descLength} / 750 chars
              </span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-paper-200 italic text-charcoal-800 leading-relaxed">
              "{profile.description || "No business description provided."}"
            </div>

            <div className="text-[11px] text-charcoal-500 space-y-1">
              {!isDescOptimal && (
                <p className="text-amber-700 font-medium flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    Description is only {descLength} characters. Google recommends 250–750 characters covering your history, specialties, and service areas.
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Operating Hours Schedule */}
        {profile.regularHours && profile.regularHours.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-charcoal-900 flex items-center gap-2 text-xs">
                <Clock className="h-4 w-4 text-emerald-700" />
                <span>Operating Hours Schedule (7 Days)</span>
              </h4>
              <span className="text-[11px] text-charcoal-500 font-mono">
                Synced with Google Maps
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {profile.regularHours.map((schedule) => (
                <div
                  key={schedule.day}
                  className="p-2.5 bg-paper-50 rounded-lg border border-paper-200 text-center space-y-1"
                >
                  <p className="font-semibold text-charcoal-900 text-xs">
                    {schedule.day.slice(0, 3)}
                  </p>
                  <p className="font-mono text-[11px] text-charcoal-600">
                    {schedule.isClosed
                      ? "Closed"
                      : `${schedule.open} – ${schedule.close}`}
                  </p>
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
