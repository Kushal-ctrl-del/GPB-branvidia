import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface JourneyStep {
  id: number;
  label: string;
  shortLabel?: string;
}

export const JOURNEY_STEPS: JourneyStep[] = [
  { id: 1, label: "Website", shortLabel: "Visit" },
  { id: 2, label: "AI Chatbot", shortLabel: "Chat" },
  { id: 3, label: "Understand Business", shortLabel: "Intake" },
  { id: 4, label: "Customer Opt-In", shortLabel: "Consent" },
  { id: 5, label: "Connect Google", shortLabel: "Auth" },
  { id: 6, label: "Business Profile", shortLabel: "Profile" },
  { id: 7, label: "AI Analysis", shortLabel: "Audit" },
  { id: 8, label: "Reviews & Photos", shortLabel: "Media" },
  { id: 9, label: "Optimization Plan", shortLabel: "Actions" },
  { id: 10, label: "Final AI Report", shortLabel: "Report" },
];

export interface JourneyStepperProps {
  currentStep: number;
  className?: string;
  variant?: "full" | "condensed";
}

export function JourneyStepper({
  currentStep,
  className,
  variant = "condensed",
}: JourneyStepperProps) {
  if (variant === "condensed") {
    // 4 major milestones: Intake (1-3), Connection (4-5), Ingestion (6), Report (7-10)
    const milestones = [
      { id: 1, label: "Business Discovery", activeThreshold: 1, completedThreshold: 4 },
      { id: 2, label: "Google Connection", activeThreshold: 4, completedThreshold: 6 },
      { id: 3, label: "Profile Audit", activeThreshold: 6, completedThreshold: 7 },
      { id: 4, label: "Intelligence Report", activeThreshold: 7, completedThreshold: 11 },
    ];

    return (
      <div className={cn("w-full py-2", className)}>
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-[2px] bg-paper-300 -z-0" />
          {milestones.map((milestone) => {
            const isCompleted = currentStep >= milestone.completedThreshold;
            const isCurrent =
              currentStep >= milestone.activeThreshold &&
              currentStep < milestone.completedThreshold;

            return (
              <div
                key={milestone.id}
                className="relative z-10 flex flex-col items-center gap-1.5 bg-paper-100 px-2"
              >
                <div
                  className={cn(
                    "h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all",
                    isCompleted &&
                      "bg-emerald-600 text-white",
                    isCurrent &&
                      "bg-branvidia-900 text-white ring-4 ring-branvidia-100",
                    !isCompleted &&
                      !isCurrent &&
                      "bg-white border border-paper-300 text-charcoal-400"
                  )}
                >
                  {isCompleted ? <Check className="h-3.5 w-3.5" /> : milestone.id}
                </div>
                <span
                  className={cn(
                    "text-[11px] font-medium tracking-tight whitespace-nowrap",
                    isCurrent
                      ? "text-branvidia-950 font-semibold"
                      : isCompleted
                      ? "text-charcoal-700"
                      : "text-charcoal-400"
                  )}
                >
                  {milestone.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full overflow-x-auto py-2", className)}>
      <div className="flex items-center gap-2 min-w-max">
        {JOURNEY_STEPS.map((step) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <div
              key={step.id}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors",
                isCurrent &&
                  "bg-branvidia-900 text-white font-medium",
                isCompleted &&
                  "bg-paper-200 text-charcoal-700",
                !isCurrent &&
                  !isCompleted &&
                  "text-charcoal-400 opacity-60"
              )}
            >
              <span className="font-mono text-[10px]">
                {step.id < 10 ? `0${step.id}` : step.id}
              </span>
              <span>{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
