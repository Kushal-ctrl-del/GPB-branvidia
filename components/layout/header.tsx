import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Sparkles, RefreshCw, History } from "lucide-react";

export interface HeaderProps {
  currentStep?: number;
  dataSource?: "demo" | "live" | "customer";
  businessName?: string;
  onReset?: () => void;
  onOpenHistory?: () => void;
}

export function Header({
  currentStep = 1,
  dataSource = "demo",
  businessName,
  onReset,
  onOpenHistory,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-paper-300 transition-all print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex items-center tracking-tight">
              <span className="text-xl font-bold text-charcoal-950 font-sans">
                bran
              </span>
              <span className="text-xl font-extrabold text-branvidia-800 font-sans">
                v
              </span>
              <span className="text-xl font-bold text-charcoal-950 font-sans">
                idia
              </span>
            </div>
            <span className="hidden sm:inline-block h-4 w-[1px] bg-paper-300" />
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-charcoal-600 bg-paper-100 px-2 py-0.5 rounded border border-paper-200">
              <Sparkles className="h-3 w-3 text-branvidia-700" />
              GBP Optimizer
            </span>
          </Link>
        </div>

        {/* Center / Context Info */}
        {businessName && (
          <div className="hidden md:flex items-center gap-2 text-xs text-charcoal-600 bg-paper-50 px-3 py-1 rounded-md border border-paper-200">
            <span className="text-charcoal-400">Auditing:</span>
            <span className="font-semibold text-charcoal-900">{businessName}</span>
          </div>
        )}

        {/* Right Actions & Data Source Indicator */}
        <div className="flex items-center gap-2 sm:gap-3">
          {dataSource === "live" ? (
            <Badge variant="live" dot size="sm">
              <span className="hidden xs:inline">Source:</span> Live Google API
            </Badge>
          ) : dataSource === "customer" ? (
            <Badge variant="brand" dot size="sm">
              <span className="hidden xs:inline">Source:</span> Customer Assets
            </Badge>
          ) : (
            <Badge variant="demo" dot size="sm">
              <span className="hidden xs:inline">Source:</span> Demo Profile
            </Badge>
          )}

          {onOpenHistory && (
            <button
              type="button"
              onClick={onOpenHistory}
              title="Audit History"
              className="flex items-center gap-1 text-xs text-charcoal-700 hover:text-charcoal-950 px-2.5 py-1 bg-paper-100 hover:bg-paper-200 border border-paper-200 rounded-md transition-colors cursor-pointer"
            >
              <History className="h-3.5 w-3.5 text-charcoal-600" />
              <span className="hidden sm:inline">History</span>
            </button>
          )}

          <div className="hidden lg:flex items-center gap-1 text-[11px] text-charcoal-500 font-mono bg-paper-100/80 px-2 py-1 rounded border border-paper-200">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Audit Engine V2</span>
          </div>

          {onReset && (
            <button
              onClick={onReset}
              title="Reset Session"
              className="text-xs text-charcoal-500 hover:text-charcoal-900 p-1.5 hover:bg-paper-200 rounded transition-colors cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
