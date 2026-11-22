"use client";

import * as React from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/marketing/hero-section";
import { ValuePropsSection } from "@/components/marketing/value-props";
import { ChatInterface } from "@/components/chat/chat-interface";
import { ConsentOptInCard } from "@/components/connect/consent-opt-in-card";
import { ConnectionStatusCard } from "@/components/connect/connection-status-card";
import { ProfileDashboard } from "@/components/dashboard/profile-dashboard";
import { AuditLoadingView } from "@/components/dashboard/audit-loading-view";
import { FinalAuditReport } from "@/components/report/final-audit-report";
import { ReportHistoryModal } from "@/components/report/report-history-modal";
import { JourneyStepper } from "@/components/ui/journey-stepper";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import {
  BusinessIntake,
  NormalizedBusinessProfile,
  CustomerUploadedPhoto,
  CustomerReviewInput,
} from "@/lib/types/contracts";
import { NormalizedReview, NormalizedMediaAsset } from "@/lib/adapters/gbp-interface";
import type { AIReportOutput } from "@/lib/ai/schemas";
import type { SavedReportEntry } from "@/lib/storage/report-history";

export default function HomePage() {
  // Journey Steps:
  // 2: Chatbot Onboarding
  // 3: Business Understanding Confirmation
  // 4: Customer Opt-In & Integration Pathways
  // 5: Google Business Profile / Asset Connected
  // 6: Profile Ingestion & Data Layer (Dashboard)
  // 7: AI Analysis Running (AuditLoadingView)
  // 10: Final Comprehensive AI Report
  const [currentStep, setCurrentStep] = React.useState<number>(2);
  const [confirmedBusiness, setConfirmedBusiness] = React.useState<BusinessIntake | null>(null);
  const [dataSource, setDataSource] = React.useState<"demo" | "live" | "customer">("demo");
  const [isConnecting, setIsConnecting] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = React.useState<boolean>(false);

  // Connected Profile Data
  const [connectedProfile, setConnectedProfile] = React.useState<NormalizedBusinessProfile | null>(null);
  const [reviews, setReviews] = React.useState<NormalizedReview[]>([]);
  const [media, setMedia] = React.useState<NormalizedMediaAsset[]>([]);
  const [availableLocations, setAvailableLocations] = React.useState<{ locationId: string; title: string; address?: string }[]>([]);

  // Generated Report
  const [auditReport, setAuditReport] = React.useState<AIReportOutput | null>(null);

  // Check for OAuth return parameters on mount (Step 4 -> Step 5 live transition)
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const searchParams = new URLSearchParams(window.location.search);
    const connection = searchParams.get("connection");
    const authError = searchParams.get("auth_error");

    if (connection === "live_success") {
      setIsConnecting(true);
      fetch("/api/profile?mode=live")
        .then(async (res) => {
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.message || "Failed to load live profile data.");
          }
          return res.json();
        })
        .then((data) => {
          setConnectedProfile(data.profile);
          setReviews(data.reviews || []);
          setMedia(data.media || []);
          setDataSource("live");
          setCurrentStep(5); // Advance to Step 5: Profile Ingestion Handshake
          setErrorMessage(null);
          window.history.replaceState({}, "", window.location.pathname);
          // Query available locations if account manages multiple GBP locations
          fetch("/api/profile?mode=live&action=locations")
            .then((r) => r.json())
            .then((d) => {
              if (d.ok && Array.isArray(d.locations)) setAvailableLocations(d.locations);
            })
            .catch(() => {});
        })
        .catch((err: any) => {
          setErrorMessage(err.message || "Could not retrieve live Google profile.");
          setCurrentStep(4);
          window.history.replaceState({}, "", window.location.pathname);
        })
        .finally(() => {
          setIsConnecting(false);
        });
    } else if (authError) {
      setErrorMessage(decodeURIComponent(authError));
      setCurrentStep(4);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  // Step 3 Completion -> Transition to Step 4
  const handleIntakeConfirmed = (intake: BusinessIntake) => {
    setConfirmedBusiness(intake);
    setCurrentStep(4); // Advance to Step 4: Customer Opt-In & Integration
    setErrorMessage(null);
  };

  // Step 4 Option C: Demo Mode Ingestion
  const handleConnectDemo = async () => {
    setIsConnecting(true);
    setErrorMessage(null);
    try {
      const activeBusiness = confirmedBusiness || activeIntake;
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "demo", intake: activeBusiness }),
      });
      if (!res.ok) {
        throw new Error("Failed to load demo profile data.");
      }
      const data = await res.json();
      setConnectedProfile(data.profile);
      setReviews(data.reviews || []);
      setMedia(data.media || []);
      setDataSource("demo");
      // Preserve customer-provided business identity 100%
      if (!confirmedBusiness) {
        setConfirmedBusiness({
          businessName: data.profile.name,
          category: data.profile.primaryCategory,
          productsServices: activeBusiness.productsServices,
          targetCustomers: activeBusiness.targetCustomers,
          businessGoals: activeBusiness.businessGoals,
          description: data.profile.description || undefined,
          websiteUrl: data.profile.websiteUrl || undefined,
        });
      }
      setCurrentStep(5); // Advance to Step 5: Profile Ingestion Handshake
    } catch (err: any) {
      setErrorMessage(err.message || "Could not connect demo profile.");
    } finally {
      setIsConnecting(false);
    }
  };

  // Switch Google Profile Location when account manages multiple GBP properties
  const handleSwitchLocation = async (newLocationId: string) => {
    setIsConnecting(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/profile?mode=live&locationId=${encodeURIComponent(newLocationId)}`);
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || "Failed to load selected Google location.");
      }
      const data = await res.json();
      setConnectedProfile(data.profile);
      setReviews(data.reviews || []);
      setMedia(data.media || []);
    } catch (err: any) {
      setErrorMessage(err?.message || "Could not switch to selected location.");
    } finally {
      setIsConnecting(false);
    }
  };

  // Step 4 Option B: Direct Owner Asset & Review Intake
  const handleDirectIntake = async (
    photos: CustomerUploadedPhoto[],
    customerReviews: CustomerReviewInput[],
    noReviewsOptOut: boolean
  ) => {
    setIsConnecting(true);
    setErrorMessage(null);
    try {
      const activeBusiness: BusinessIntake = {
        ...(confirmedBusiness || activeIntake),
        uploadedPhotos: photos,
        customerReviews: noReviewsOptOut ? [] : customerReviews,
        reviewSource: noReviewsOptOut ? "none" : customerReviews.length > 0 ? "customer_provided" : "none",
      };
      setConfirmedBusiness(activeBusiness);

      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "customer", intake: activeBusiness }),
      });

      if (!res.ok) {
        throw new Error("Failed to process customer business assets.");
      }

      const data = await res.json();
      setConnectedProfile(data.profile);
      setReviews(data.reviews || []);
      setMedia(data.media || []);
      setDataSource("customer");
      setCurrentStep(5); // Advance to Step 5: Ingestion Handshake
    } catch (err: any) {
      setErrorMessage(err.message || "Could not ingest customer assets.");
    } finally {
      setIsConnecting(false);
    }
  };

  // Step 4 Option A: Live Google OAuth Initiation
  const handleInitiateLiveOAuth = async () => {
    setIsConnecting(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/auth/google/start", { redirect: "manual" });
      if (res.status === 400) {
        const errorData = await res.json();
        setErrorMessage(`Live OAuth Notice: ${errorData.message}`);
      } else {
        window.location.href = "/api/auth/google/start";
      }
    } catch (err: any) {
      setErrorMessage(`Live connection error: ${err.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect Action
  const handleDisconnect = async () => {
    await fetch("/api/auth/disconnect", { method: "POST" });
    setConnectedProfile(null);
    setReviews([]);
    setMedia([]);
    setAvailableLocations([]);
    setAuditReport(null);
    setCurrentStep(4); // Return to connection options
  };

  // Full Session Reset
  const handleReset = () => {
    setConfirmedBusiness(null);
    setConnectedProfile(null);
    setReviews([]);
    setMedia([]);
    setAvailableLocations([]);
    setAuditReport(null);
    setCurrentStep(2);
    setErrorMessage(null);
  };

  // Re-run Analysis
  const handleReRunAnalysis = () => {
    setAuditReport(null);
    setCurrentStep(7);
  };

  // Restore report from history modal
  const handleSelectHistoryReport = (entry: SavedReportEntry) => {
    setAuditReport(entry.report);
    setDataSource(entry.dataSource);
    setConnectedProfile({
      dataSource: entry.dataSource === "live" ? "LIVE_GOOGLE" : entry.dataSource === "customer" ? "CUSTOMER_PROVIDED" : "SIMULATED_DEMO",
      locationId: `hist_${entry.id}`,
      name: entry.businessName,
      primaryCategory: entry.category,
      additionalCategories: [],
      address: { city: "Historical Record", country: "United States" },
      phoneNumber: null,
      websiteUrl: null,
      description: null,
      metrics: {
        reviewCount: entry.reviewCount,
        averageRating: entry.report.reviewInsights.averageRating,
        photosCount: entry.photoCount,
        responseRatePercent: entry.report.reviewInsights.responseRate,
      },
      missingFields: [],
    });
    setCurrentStep(10);
  };

  // Single source of truth: customer's confirmed business takes precedence, with connected profile name fallback
  const activeIntake: BusinessIntake = {
    businessName: confirmedBusiness?.businessName || connectedProfile?.name || "Third Wave Roastery & Artisan Cafe",
    category: confirmedBusiness?.category || connectedProfile?.primaryCategory || "Coffee Roasters",
    productsServices: confirmedBusiness?.productsServices && confirmedBusiness.productsServices.length > 0
      ? confirmedBusiness.productsServices
      : [
          "Specialty Single-Origin Pour Over",
          "Espresso & Handcrafted Lattes",
          "Fresh Artisanal Pastries",
          "Retail Whole Bean Coffee Bags",
        ],
    targetCustomers: confirmedBusiness?.targetCustomers || "Specialty coffee lovers, neighborhood regulars, and remote workers looking for a refined cafe atmosphere",
    businessGoals: confirmedBusiness?.businessGoals && confirmedBusiness.businessGoals.length > 0
      ? confirmedBusiness.businessGoals
      : [
          "Improve Google Local search discoverability",
          "Reply promptly to customer reviews",
          "Increase retail whole bean sales",
        ],
    description: confirmedBusiness?.description || connectedProfile?.description || undefined,
    websiteUrl: confirmedBusiness?.websiteUrl || connectedProfile?.websiteUrl || undefined,
    address: confirmedBusiness?.address || connectedProfile?.address || undefined,
    socialLinks: confirmedBusiness?.socialLinks || connectedProfile?.socialLinks || undefined,
    reviewSource: confirmedBusiness?.reviewSource || (dataSource === "live" ? "live" : dataSource === "customer" ? "customer_provided" : "demo"),
    uploadedPhotos: confirmedBusiness?.uploadedPhotos || [],
    customerReviews: confirmedBusiness?.customerReviews || [],
  };

  return (
    <div className="min-h-screen flex flex-col bg-paper-100 text-charcoal-900">
      {/* Sticky Editorial Header */}
      <Header
        currentStep={currentStep}
        dataSource={dataSource}
        businessName={connectedProfile?.name || confirmedBusiness?.businessName}
        onReset={handleReset}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Stepper Progress Bar */}
        <section className="bg-white border border-paper-300 rounded-xl p-4 shadow-subtle print:hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-500 font-mono">
                Audit Lifecycle
              </span>
              <Badge
                variant={
                  currentStep === 10
                    ? "live"
                    : currentStep >= 7
                    ? "brand"
                    : currentStep >= 5
                    ? "live"
                    : currentStep >= 4
                    ? "brand"
                    : "neutral"
                }
                size="sm"
              >
                Stage {currentStep} of 10:{" "}
                {currentStep === 2
                  ? "AI Chatbot Onboarding"
                  : currentStep === 3
                  ? "Understanding Business"
                  : currentStep === 4
                  ? "Asset & Data Connection"
                  : currentStep === 5
                  ? "Profile Ingested"
                  : currentStep === 6
                  ? "Profile Ingestion & Data Layer"
                  : currentStep === 7
                  ? "AI Analysis Engine Active"
                  : "Comprehensive AI Report"}
              </Badge>
            </div>
            <span className="text-xs text-charcoal-500 font-mono">
              {connectedProfile
                ? `Active Profile: ${connectedProfile.name}`
                : confirmedBusiness
                ? `Intake: ${confirmedBusiness.businessName}`
                : "Awaiting business intake"}
            </span>
          </div>
          <JourneyStepper currentStep={currentStep} variant="condensed" />
        </section>

        {/* Global Error Banner */}
        {errorMessage && (
          <Callout
            variant="warning"
            title="Notice & Integration Guidance"
            sourceCitation="OAUTH_ROUTER"
          >
            <div className="space-y-2">
              <p>{errorMessage}</p>
              <div className="pt-1">
                <Button size="sm" variant="secondary" onClick={handleConnectDemo}>
                  Switch to Demo Profile (Instant Access)
                </Button>
              </div>
            </div>
          </Callout>
        )}

        {/* Dynamic Workspace based on Customer Journey Stage */}
        <section id="onboarding-workspace" className="scroll-mt-20">
          {currentStep === 10 && auditReport && connectedProfile ? (
            /* STEP 10: Comprehensive Executive AI Report */
            <FinalAuditReport
              report={auditReport}
              businessName={connectedProfile.name}
              onReset={handleReset}
              onReRunAnalysis={handleReRunAnalysis}
              onOpenHistory={() => setIsHistoryOpen(true)}
              dataSource={dataSource}
            />
          ) : currentStep === 7 && connectedProfile ? (
            /* STEP 7-9: AI Analysis Execution in Progress */
            <AuditLoadingView
              businessName={connectedProfile.name}
              reviewCount={reviews.length}
              photoCount={media.length}
              intake={activeIntake}
              mode={dataSource}
              onComplete={(report) => {
                setAuditReport(report);
                setCurrentStep(10);
              }}
            />
          ) : currentStep === 6 && connectedProfile ? (
            /* STEP 6: Deep-Dive Profile Dashboard */
            <ProfileDashboard
              profile={connectedProfile}
              reviews={reviews}
              media={media}
              onProceedToAnalysis={() => setCurrentStep(7)}
              onDisconnect={handleDisconnect}
            />
          ) : currentStep === 5 && connectedProfile ? (
            /* STEP 5: Google Business Profile / Assets Connected Handshake */
            <ConnectionStatusCard
              profile={connectedProfile}
              reviewsCount={reviews.length}
              photosCount={media.length}
              onProceedToAudit={() => setCurrentStep(6)}
              onDisconnect={handleDisconnect}
              availableLocations={availableLocations}
              onSwitchLocation={handleSwitchLocation}
            />
          ) : currentStep === 4 && confirmedBusiness ? (
            /* STEP 4: Explicit Customer Opt-In & Integration Modes */
            <ConsentOptInCard
              businessName={confirmedBusiness.businessName}
              onSelectDemo={handleConnectDemo}
              onInitiateLiveOAuth={handleInitiateLiveOAuth}
              onDirectIntake={handleDirectIntake}
              isConnecting={isConnecting}
              initialPhotos={confirmedBusiness.uploadedPhotos || []}
              initialReviews={confirmedBusiness.customerReviews || []}
            />
          ) : (
            /* STEP 1-3: Website & Conversational Onboarding */
            <div className="space-y-10">
              <HeroSection />

              <Card className="border-paper-300 shadow-editorial bg-white overflow-hidden">
                <CardHeader className="bg-paper-50/70 border-b border-paper-200 py-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <CardTitle className="text-lg font-semibold text-charcoal-950">
                        Branvidia AI Advisor • Business Understanding Dialogue
                      </CardTitle>
                    </div>
                    <CardDescription className="text-xs text-charcoal-600 mt-0.5">
                      Powered by Groq Cloud (`openai/gpt-oss-20b`) with server-side streaming & Zod validation.
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="brand" size="sm">
                      Active Model: openai/gpt-oss-20b
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-4 sm:p-6">
                  <ChatInterface
                    onIntakeConfirmed={handleIntakeConfirmed}
                    initialIntake={confirmedBusiness || {}}
                  />
                </CardContent>
              </Card>

              <ValuePropsSection />
            </div>
          )}
        </section>
      </main>

      {/* Audit History Modal */}
      <ReportHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectReport={handleSelectHistoryReport}
      />

      {/* Dignified Corporate Footer */}
      <Footer />
    </div>
  );
}
