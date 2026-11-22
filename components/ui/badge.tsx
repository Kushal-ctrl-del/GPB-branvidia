import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "demo"
    | "live"
    | "brand"
    | "neutral"
    | "success"
    | "warning"
    | "danger"
    | "critical"
    | "outline";
  size?: "sm" | "md";
  dot?: boolean;
}

export function Badge({
  className,
  variant = "neutral",
  size = "md",
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    demo: "bg-indigo-50/80 text-indigo-900 border border-indigo-200/80 font-medium",
    live: "bg-emerald-50 text-emerald-900 border border-emerald-200 font-medium",
    brand: "bg-branvidia-50 text-branvidia-900 border border-branvidia-200/80 font-medium",
    neutral: "bg-paper-200 text-charcoal-700 border border-paper-300 font-medium",
    success: "bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium",
    warning: "bg-amber-50 text-amber-800 border border-amber-200 font-medium",
    danger: "bg-rose-50 text-rose-800 border border-rose-200 font-medium",
    critical: "bg-rose-50 text-rose-800 border border-rose-200 font-medium",
    outline: "bg-transparent text-charcoal-700 border border-charcoal-300 font-medium",
  };

  const dotColors = {
    demo: "bg-indigo-600",
    live: "bg-emerald-600 animate-pulse",
    brand: "bg-branvidia-700",
    neutral: "bg-charcoal-500",
    success: "bg-emerald-600",
    warning: "bg-amber-600",
    danger: "bg-rose-600",
    critical: "bg-rose-600",
    outline: "bg-charcoal-500",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs rounded-full gap-1.5",
    md: "px-2.5 py-1 text-xs rounded-md gap-1.5",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center tracking-tight transition-colors",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotColors[variant])}
        />
      )}
      <span>{children}</span>
    </div>
  );
}
