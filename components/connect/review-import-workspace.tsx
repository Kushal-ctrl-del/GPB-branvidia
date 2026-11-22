"use client";

import * as React from "react";
import { CustomerReviewInput } from "@/lib/types/contracts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  MessageSquare,
  Upload,
  Star,
  Plus,
  Trash2,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Download,
  Info,
  CornerDownRight,
} from "lucide-react";

export interface ReviewImportWorkspaceProps {
  reviews: CustomerReviewInput[];
  onChange: (reviews: CustomerReviewInput[]) => void;
  noReviewsOptOut: boolean;
  onToggleNoReviews: (noReviews: boolean) => void;
}

export function ReviewImportWorkspace({
  reviews,
  onChange,
  noReviewsOptOut,
  onToggleNoReviews,
}: ReviewImportWorkspaceProps) {
  const [activeTab, setActiveTab] = React.useState<"manual" | "csv">("manual");
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [csvError, setCsvError] = React.useState<string | null>(null);

  // Manual Review Form State
  const [authorName, setAuthorName] = React.useState("");
  const [starRating, setStarRating] = React.useState<number>(5);
  const [comment, setComment] = React.useState("");
  const [reviewDate, setReviewDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [merchantReply, setMerchantReply] = React.useState("");
  const [hasReply, setHasReply] = React.useState(false);

  // Handle Manual Add
  const handleAddManualReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !comment.trim()) return;

    const newReview: CustomerReviewInput = {
      reviewId: `cust_rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      authorName: authorName.trim(),
      starRating,
      comment: comment.trim(),
      createTime: new Date(reviewDate).toISOString(),
      reviewReply: hasReply && merchantReply.trim()
        ? {
            comment: merchantReply.trim(),
            updateTime: new Date().toISOString(),
          }
        : undefined,
      source: "CUSTOMER_PROVIDED",
    };

    onChange([newReview, ...reviews]);
    if (noReviewsOptOut) onToggleNoReviews(false);

    // Reset Form
    setAuthorName("");
    setComment("");
    setMerchantReply("");
    setHasReply(false);
  };

  // Handle CSV Upload
  const handleCsvFile = (file: File) => {
    setCsvError(null);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) {
          setCsvError("File appears to be empty.");
          return;
        }

        const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
        if (lines.length < 2) {
          setCsvError("CSV must contain a header row and at least one review record.");
          return;
        }

        // Parse header
        const header = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/['"]/g, ""));
        const authorIdx = header.findIndex((h) => h.includes("author") || h.includes("name") || h.includes("reviewer"));
        const ratingIdx = header.findIndex((h) => h.includes("rating") || h.includes("star") || h.includes("score"));
        const commentIdx = header.findIndex((h) => h.includes("comment") || h.includes("text") || h.includes("review") || h.includes("body"));
        const dateIdx = header.findIndex((h) => h.includes("date") || h.includes("time") || h.includes("created"));
        const replyIdx = header.findIndex((h) => h.includes("reply") || h.includes("response") || h.includes("owner"));

        if (authorIdx === -1 || ratingIdx === -1 || commentIdx === -1) {
          setCsvError(
            "Could not identify required columns. Please ensure CSV headers include: Author, Rating, and Comment."
          );
          return;
        }

        const importedReviews: CustomerReviewInput[] = [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          // Basic CSV regex to handle commas inside quotes
          const match = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
          const cols = line.split(",").map((c) => c.trim().replace(/^"(.*)"$/, "$1"));

          if (cols.length >= 3) {
            const rawAuthor = cols[authorIdx] || `Reviewer ${i}`;
            const rawRating = parseFloat(cols[ratingIdx]) || 5;
            const validRating = Math.max(1, Math.min(5, Math.round(rawRating)));
            const rawComment = cols[commentIdx] || "";
            const rawDate = dateIdx !== -1 && cols[dateIdx] ? cols[dateIdx] : new Date().toISOString();
            const rawReply = replyIdx !== -1 && cols[replyIdx] ? cols[replyIdx] : undefined;

            if (rawComment) {
              importedReviews.push({
                reviewId: `csv_rev_${Date.now()}_${i}`,
                authorName: rawAuthor,
                starRating: validRating,
                comment: rawComment,
                createTime: new Date(rawDate).toISOString(),
                reviewReply: rawReply
                  ? {
                      comment: rawReply,
                      updateTime: new Date().toISOString(),
                    }
                  : undefined,
                source: "CUSTOMER_PROVIDED",
              });
            }
          }
        }

        if (importedReviews.length === 0) {
          setCsvError("No valid review rows could be extracted from this CSV file.");
          return;
        }

        onChange([...importedReviews, ...reviews]);
        if (noReviewsOptOut) onToggleNoReviews(false);
      } catch (err: any) {
        setCsvError(`Failed to parse CSV: ${err.message}`);
      }
    };

    reader.onerror = () => {
      setCsvError("An error occurred while reading the file.");
    };

    reader.readAsText(file);
  };

  const handleRemoveReview = (id: string) => {
    const updated = reviews.filter((r) => r.reviewId !== id);
    onChange(updated);
  };

  const downloadSampleCsv = () => {
    const sample = `Author,Rating,Comment,Date,Reply
"Emily Watson",5,"The highest quality selection in town! The staff was incredibly knowledgeable.",2026-10-15,"Thank you Emily! We love having you in."
"Marcus Vance",2,"Great products but waited almost 20 minutes for assistance during peak hours.",2026-10-22,""
"Aria Chen",4,"Wonderful atmosphere and clean presentation. Will definitely return.",2026-10-28,""`;
    const blob = new Blob([sample], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "branvidia_sample_reviews.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Compute live statistics from customer reviews
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + r.starRating, 0) / totalReviews).toFixed(1)
    : "0.0";
  const repliedCount = reviews.filter((r) => Boolean(r.reviewReply)).length;
  const responseRate = totalReviews > 0 ? Math.round((repliedCount / totalReviews) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-paper-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("manual")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "manual"
                ? "bg-branvidia-900 text-white shadow-subtle"
                : "text-charcoal-600 hover:text-charcoal-900 hover:bg-paper-200"
            }`}
          >
            Manual Add / Paste Review
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("csv")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "csv"
                ? "bg-branvidia-900 text-white shadow-subtle"
                : "text-charcoal-600 hover:text-charcoal-900 hover:bg-paper-200"
            }`}
          >
            Import CSV File
          </button>
        </div>

        {/* Opt-Out of Reviews button */}
        <button
          type="button"
          onClick={() => {
            const next = !noReviewsOptOut;
            onToggleNoReviews(next);
            if (next) onChange([]);
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
            noReviewsOptOut
              ? "bg-amber-100 border-amber-300 text-amber-900 font-semibold"
              : "bg-paper-100 border-paper-300 text-charcoal-600 hover:bg-paper-200"
          }`}
        >
          {noReviewsOptOut ? "✓ No Reviews (Review Analysis Omitted)" : "I Don't Have Reviews Yet"}
        </button>
      </div>

      {noReviewsOptOut ? (
        /* Explanatory callout when opting out */
        <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-200/90 text-amber-900 text-xs space-y-2">
          <div className="flex items-center gap-2 font-semibold text-amber-950">
            <Info className="h-4 w-4 text-amber-700" />
            <span>Review Analysis Will Be Omitted Without Score Penalty</span>
          </div>
          <p className="leading-relaxed">
            Because you do not have review records yet, Branvidia will not calculate false sentiment metrics or invent a response rate. Your 100-point optimization score will be computed transparently from Profile Completeness, Media Distribution, and Local SEO dimensions.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="border-amber-300 text-amber-900 hover:bg-amber-100"
            onClick={() => onToggleNoReviews(false)}
          >
            Re-enable Review Input
          </Button>
        </div>
      ) : activeTab === "manual" ? (
        /* Manual Review Entry Form */
        <form onSubmit={handleAddManualReview} className="bg-paper-50 p-4 sm:p-5 rounded-xl border border-paper-200 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-charcoal-700 uppercase tracking-wider block mb-1">
                Customer / Reviewer Name *
              </label>
              <input
                type="text"
                required
                value={authorName}
                placeholder="e.g. David Miller"
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full text-xs bg-white border border-paper-300 rounded-lg px-3 py-2 text-charcoal-900 focus:outline-none focus:ring-1 focus:ring-branvidia-700"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-charcoal-700 uppercase tracking-wider block mb-1">
                Star Rating ({starRating}★)
              </label>
              <div className="flex items-center gap-1 h-9 bg-white border border-paper-300 rounded-lg px-2.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setStarRating(star)}
                    className="p-1 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`h-4 w-4 ${
                        star <= starRating ? "fill-amber-500 text-amber-500" : "text-paper-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-charcoal-700 uppercase tracking-wider block mb-1">
                Date of Review
              </label>
              <input
                type="date"
                value={reviewDate}
                onChange={(e) => setReviewDate(e.target.value)}
                className="w-full text-xs bg-white border border-paper-300 rounded-lg px-3 py-2 text-charcoal-900 focus:outline-none focus:ring-1 focus:ring-branvidia-700 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-charcoal-700 uppercase tracking-wider block mb-1">
              Review Comment / Text *
            </label>
            <textarea
              required
              rows={2}
              value={comment}
              placeholder="Paste or write the customer's exact review feedback here..."
              onChange={(e) => setComment(e.target.value)}
              className="w-full text-xs bg-white border border-paper-300 rounded-lg px-3 py-2 text-charcoal-900 focus:outline-none focus:ring-1 focus:ring-branvidia-700"
            />
          </div>

          {/* Optional Owner Reply Toggle */}
          <div className="space-y-2 pt-1 border-t border-paper-200">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-charcoal-700 font-medium">
              <input
                type="checkbox"
                checked={hasReply}
                onChange={(e) => setHasReply(e.target.checked)}
                className="rounded border-paper-300 text-branvidia-800 focus:ring-branvidia-700"
              />
              <span>I have already replied to this review</span>
            </label>

            {hasReply && (
              <textarea
                rows={2}
                value={merchantReply}
                placeholder="Enter your published reply to this customer..."
                onChange={(e) => setMerchantReply(e.target.value)}
                className="w-full text-xs bg-white border border-paper-300 rounded-lg px-3 py-2 text-charcoal-900 focus:outline-none focus:ring-1 focus:ring-branvidia-700"
              />
            )}
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              size="sm"
              variant="primary"
              leftIcon={<Plus className="h-3.5 w-3.5" />}
              disabled={!authorName.trim() || !comment.trim()}
            >
              Add Customer Review
            </Button>
          </div>
        </form>
      ) : (
        /* CSV Upload Dropzone */
        <div className="space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-paper-300 rounded-xl p-6 text-center bg-paper-50/60 hover:border-branvidia-600 hover:bg-paper-100/60 transition-all cursor-pointer"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleCsvFile(e.target.files[0]);
              }}
            />
            <div className="max-w-md mx-auto space-y-2">
              <FileSpreadsheet className="h-8 w-8 text-branvidia-800 mx-auto" />
              <h4 className="text-sm font-semibold text-charcoal-950">
                Upload CSV File with Reviews
              </h4>
              <p className="text-xs text-charcoal-500">
                Columns expected: <code className="bg-white px-1 py-0.5 rounded border border-paper-200">Author, Rating, Comment, Date, Reply</code>
              </p>
              <div className="pt-2">
                <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); downloadSampleCsv(); }}>
                  <Download className="h-3.5 w-3.5 mr-1" />
                  Download Sample CSV
                </Button>
              </div>
            </div>
          </div>

          {csvError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{csvError}</span>
            </div>
          )}
        </div>
      )}

      {/* Customer Reviews List & Summary Bar */}
      {!noReviewsOptOut && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-paper-100 rounded-xl border border-paper-200">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-branvidia-800" />
              <span className="text-xs font-semibold text-charcoal-900">
                {reviews.length} Customer-Provided Review{reviews.length === 1 ? "" : "s"}
              </span>
              <Badge variant="live" size="sm">
                Source: CUSTOMER_PROVIDED
              </Badge>
            </div>

            {totalReviews > 0 && (
              <div className="flex items-center gap-3 text-xs text-charcoal-600">
                <span>Calculated Rating: <strong>{avgRating}★</strong></span>
                <span>Response Rate: <strong>{responseRate}%</strong> ({repliedCount}/{totalReviews})</span>
              </div>
            )}
          </div>

          {reviews.length === 0 ? (
            <div className="p-6 text-center bg-white border border-paper-300 rounded-xl text-xs text-charcoal-500 space-y-1">
              <p className="font-medium text-charcoal-700">No review records added yet.</p>
              <p>Add your customer reviews above or click &quot;I Don&apos;t Have Reviews Yet&quot; to continue without reviews.</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {reviews.map((r) => (
                <div
                  key={r.reviewId}
                  className="p-3.5 bg-white border border-paper-200 rounded-xl flex flex-col sm:flex-row sm:items-start justify-between gap-3 shadow-subtle hover:border-paper-300 transition-all"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-charcoal-950">{r.authorName}</span>
                      <div className="flex text-amber-500">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`h-3 w-3 ${
                              s <= r.starRating ? "fill-current text-amber-500" : "text-paper-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-charcoal-400 font-mono">
                        {new Date(r.createTime).toLocaleDateString()}
                      </span>
                      <Badge variant="neutral" size="sm" className="text-[9px]">
                        Customer Provided
                      </Badge>
                    </div>

                    <p className="text-xs text-charcoal-800 leading-relaxed font-sans">&ldquo;{r.comment}&rdquo;</p>

                    {r.reviewReply && (
                      <div className="pl-3 border-l-2 border-branvidia-300 text-[11px] text-charcoal-600 mt-1 flex items-start gap-1">
                        <CornerDownRight className="h-3 w-3 text-branvidia-700 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-charcoal-800">Your Reply: </span>
                          <span>{r.reviewReply.comment}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveReview(r.reviewId)}
                    aria-label="Remove review"
                    className="p-1.5 text-charcoal-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
