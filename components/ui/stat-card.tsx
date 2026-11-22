import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "./card";

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  suffix?: string;
  benchmark?: string;
  sourceCitation?: string;
  status?: "neutral" | "positive" | "warning" | "critical";
  icon?: React.ReactNode;
}

export function StatCard({
  label,
  value,
  suffix,
  benchmark,
  sourceCitation,
  status = "neutral",
  icon,
  className,
  ...props
}: StatCardProps) {
  const statusAccent = {
    neutral: "text-charcoal-900",
    positive: "text-emerald-700",
    warning: "text-amber-700",
    critical: "text-rose-700",
  };

  return (
    <Card className={cn("p-5 relative", className)} {...props}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wider text-charcoal-500">
          {label}
        </p>
        {icon && (
          <span className="text-charcoal-400 p-1 bg-paper-100 rounded-md">
            {icon}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-1">
        <span
          className={cn(
            "text-3xl font-semibold tracking-tight font-sans",
            statusAccent[status]
          )}
        >
          {value}
        </span>
        {suffix && (
          <span className="text-sm font-medium text-charcoal-500">{suffix}</span>
        )}
      </div>

      <div className="mt-2.5 pt-2.5 border-t border-paper-200/80 flex items-center justify-between text-xs text-charcoal-600">
        {benchmark && <span>{benchmark}</span>}
        {sourceCitation && (
          <span className="font-mono text-[11px] text-charcoal-400 bg-paper-100 px-1.5 py-0.5 rounded">
            {sourceCitation}
          </span>
        )}
      </div>
    </Card>
  );
}
