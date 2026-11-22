import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Info,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

export interface CalloutProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "warning" | "verified" | "fallback" | "danger";
  title?: string;
  sourceCitation?: string;
}

export function Callout({
  variant = "info",
  title,
  sourceCitation,
  children,
  className,
  ...props
}: CalloutProps) {
  const config = {
    info: {
      container: "bg-paper-100 border-paper-300 text-charcoal-800",
      icon: <Info className="h-5 w-5 text-charcoal-600 shrink-0 mt-0.5" />,
      titleColor: "text-charcoal-900",
    },
    warning: {
      container: "bg-amber-50/70 border-amber-200 text-amber-900",
      icon: <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />,
      titleColor: "text-amber-950",
    },
    verified: {
      container: "bg-emerald-50/70 border-emerald-200 text-emerald-900",
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />,
      titleColor: "text-emerald-950",
    },
    fallback: {
      container: "bg-indigo-50/70 border-indigo-200 text-indigo-950",
      icon: <HelpCircle className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />,
      titleColor: "text-indigo-950",
    },
    danger: {
      container: "bg-rose-50/70 border-rose-200 text-rose-950",
      icon: <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />,
      titleColor: "text-rose-950",
    },
  };

  const current = config[variant];

  return (
    <div
      className={cn(
        "p-4 rounded-xl border flex items-start gap-3.5 text-sm transition-all",
        current.container,
        className
      )}
      {...props}
    >
      {current.icon}
      <div className="flex-1 space-y-1">
        {title && (
          <div className="flex items-center justify-between gap-2">
            <h4 className={cn("font-semibold text-sm", current.titleColor)}>
              {title}
            </h4>
            {sourceCitation && (
              <span className="font-mono text-[11px] opacity-75 bg-white/60 px-1.5 py-0.5 rounded">
                {sourceCitation}
              </span>
            )}
          </div>
        )}
        <div className="leading-relaxed text-charcoal-700">{children}</div>
      </div>
    </div>
  );
}
