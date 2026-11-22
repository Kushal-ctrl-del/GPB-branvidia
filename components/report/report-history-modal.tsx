"use client";

import * as React from "react";
import { SavedReportEntry, getReportHistory, deleteReportFromHistory, clearAllReportHistory } from "@/lib/storage/report-history";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  History,
  X,
  Building,
  Calendar,
  Star,
  Camera,
  Trash2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

export interface ReportHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectReport: (entry: SavedReportEntry) => void;
}

export function ReportHistoryModal({
  isOpen,
  onClose,
  onSelectReport,
}: ReportHistoryModalProps) {
  const [history, setHistory] = React.useState<SavedReportEntry[]>([]);

  React.useEffect(() => {
    if (isOpen) {
      setHistory(getReportHistory());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteReportFromHistory(id);
    setHistory(getReportHistory());
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear your entire report history?")) {
      clearAllReportHistory();
      setHistory([]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-paper-300 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 bg-paper-50/80 border-b border-paper-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-branvidia-50 border border-branvidia-200 flex items-center justify-center text-branvidia-800">
              <History className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-charcoal-950">
                Audit Report History
              </h3>
              <p className="text-xs text-charcoal-500">
                Saved reports persisted across sessions in your browser storage.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-charcoal-400 hover:text-charcoal-950 hover:bg-paper-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-3">
          {history.length === 0 ? (
            <div className="py-12 text-center text-xs text-charcoal-500 space-y-2">
              <History className="h-8 w-8 text-charcoal-300 mx-auto" />
              <p className="font-medium text-charcoal-700">No previous audit reports found.</p>
              <p>Completed optimization reports will automatically appear here for quick review.</p>
            </div>
          ) : (
            history.map((entry) => (
              <div
                key={entry.id}
                onClick={() => {
                  onSelectReport(entry);
                  onClose();
                }}
                className="p-4 bg-paper-50 hover:bg-white border border-paper-200 hover:border-branvidia-500 rounded-xl transition-all shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-charcoal-950 text-sm group-hover:text-branvidia-800 transition-colors">
                      {entry.businessName}
                    </h4>
                    <Badge variant={entry.dataSource === "live" ? "live" : entry.dataSource === "customer" ? "brand" : "demo"} size="sm">
                      {entry.dataSource === "live" ? "Live Google" : entry.dataSource === "customer" ? "Customer Input" : "Demo"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-charcoal-500">
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Calendar className="h-3 w-3" />
                      {new Date(entry.generatedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span>•</span>
                    <span>{entry.category}</span>
                    <span>•</span>
                    <span>{entry.reviewCount} reviews</span>
                    <span>•</span>
                    <span>{entry.photoCount} photos</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="text-right">
                    <div className="text-lg font-bold font-serif text-charcoal-950">
                      {entry.optimizationScore}
                      <span className="text-xs font-normal text-charcoal-400">/100</span>
                    </div>
                    <Badge variant={entry.scoreGrade === "A" ? "success" : entry.scoreGrade === "B" ? "brand" : "warning"} size="sm">
                      Grade {entry.scoreGrade}
                    </Badge>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, entry.id)}
                    className="p-1.5 text-charcoal-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete saved report"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <ChevronRight className="h-4 w-4 text-charcoal-300 group-hover:text-branvidia-800 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="p-3.5 bg-paper-100/80 border-t border-paper-200 flex items-center justify-between text-xs text-charcoal-500">
            <span>{history.length} saved audit report{history.length === 1 ? "" : "s"}</span>
            <Button size="sm" variant="ghost" className="text-rose-700 hover:bg-rose-50" onClick={handleClearAll}>
              Clear All History
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
