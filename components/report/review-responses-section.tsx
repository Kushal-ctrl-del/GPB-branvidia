'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  MessageSquareReply,
  Copy,
  Check,
  Star,
  ShieldCheck,
  Edit3,
  CheckCheck,
  AlertCircle,
  Info,
} from 'lucide-react'
import type { ReviewResponses } from '@/lib/ai/schemas'

interface ReviewResponsesSectionProps {
  reviewResponses: ReviewResponses
}

export function ReviewResponsesSection({ reviewResponses }: ReviewResponsesSectionProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editedReplies, setEditedReplies] = useState<Record<string, string>>({})

  const handleCopy = (id: string, text: string) => {
    const finalContent = editedReplies[id] ?? text
    navigator.clipboard.writeText(finalContent)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleTextChange = (id: string, newText: string) => {
    setEditedReplies((prev) => ({ ...prev, [id]: newText }))
  }

  const toneBadges = {
    GRATEFUL: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    EMPATHETIC: 'bg-blue-50 text-blue-800 border-blue-300',
    PROFESSIONAL: 'bg-paper-100 text-charcoal-800 border-paper-300',
    APOLOGETIC: 'bg-rose-50 text-rose-800 border-rose-300',
  }

  const responses = reviewResponses.responses || []

  return (
    <Card className="border-paper-300 bg-white shadow-subtle overflow-hidden">
      <CardHeader className="bg-paper-50/50 border-b border-paper-200 py-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MessageSquareReply className="w-4 h-4 text-branvidia-600" />
          <CardTitle className="text-base font-semibold text-charcoal-900">
            Section 7 • Suggested Customer Review Replies
          </CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" size="sm" className="bg-paper-100 text-charcoal-700 border-paper-300">
            AI Drafts (Unpublished)
          </Badge>
          <Badge variant="brand" size="sm">
            {responses.length} Draft Responses Prepared
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Safety & Compliance Guarantee */}
        <div className="p-3.5 bg-paper-50 rounded-lg border border-paper-200 text-xs text-charcoal-700 leading-relaxed flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold text-charcoal-900 block text-[11px] uppercase tracking-wider font-mono">
              Merchant Publishing Safety Policy
            </span>
            <p className="text-[11px]">
              Branvidia <strong>never automatically publishes replies</strong> to Google. All suggestions are generated drafts for your review. You can customize any response using the &ldquo;Edit Draft&rdquo; button before copying and publishing in your official Google Business Profile manager.
            </p>
          </div>
        </div>

        {responses.length === 0 ? (
          /* Empty State when no reviews were available */
          <div className="p-8 text-center bg-paper-50 rounded-xl border border-paper-200 text-xs text-charcoal-500 space-y-2">
            <Info className="w-6 h-6 text-charcoal-400 mx-auto" />
            <h4 className="font-semibold text-charcoal-900">No Review Reply Suggestions Generated</h4>
            <p className="max-w-md mx-auto text-charcoal-600">
              Review responses are only synthesized when authentic unreplied reviews are provided. Connect your live Google account or import customer reviews to receive personalized response drafts.
            </p>
          </div>
        ) : (
          <>
            {/* Tone Guidance Callout */}
            {reviewResponses.toneGuidelines && (
              <div className="p-3.5 bg-paper-50 rounded-lg border border-paper-200 text-xs text-charcoal-700 leading-relaxed">
                <span className="font-semibold text-charcoal-900 block mb-0.5">
                  Branvidia Tone Standards:
                </span>
                {reviewResponses.toneGuidelines}
              </div>
            )}

            {/* Responses Stream */}
            <div className="space-y-4">
              {responses.map((resp) => {
                const isCopied = copiedId === resp.reviewId
                const isEditing = editingId === resp.reviewId
                const currentText = editedReplies[resp.reviewId] ?? resp.suggestedReply

                return (
                  <div
                    key={resp.reviewId}
                    className="p-4 rounded-xl border border-paper-200 bg-white hover:border-paper-300 transition-all space-y-3"
                  >
                    {/* Header with reviewer & rating */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-paper-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-charcoal-900">
                          {resp.reviewerDisplayName}
                        </span>
                        <div className="flex text-amber-500">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${
                                s <= resp.originalRating
                                  ? 'fill-current text-amber-500'
                                  : 'text-charcoal-200'
                              }`}
                            />
                          ))}
                        </div>
                        <Badge variant="neutral" size="sm" className="text-[9px]">
                          Unanswered Public Review
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border uppercase tracking-wider ${
                            toneBadges[resp.replyTone]
                          }`}
                        >
                          {resp.replyTone}
                        </span>
                        <span className="text-[10px] font-mono text-charcoal-400">
                          ID: {resp.reviewId}
                        </span>
                      </div>
                    </div>

                    {/* Original Snippet */}
                    {resp.originalSnippet && (
                      <p className="text-xs text-charcoal-600 italic pl-3 border-l-2 border-paper-300">
                        &ldquo;{resp.originalSnippet}&rdquo;
                      </p>
                    )}

                    {/* AI Suggested Reply Box (with Inline Editing) */}
                    <div className="p-3 bg-paper-50 rounded-lg border border-paper-200 relative group space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-charcoal-500">
                        <span className="font-semibold text-charcoal-700 flex items-center gap-1">
                          <span>AI Suggested Draft</span>
                          {editedReplies[resp.reviewId] && (
                            <span className="text-[10px] text-brand-700 font-normal italic">(Edited by merchant)</span>
                          )}
                        </span>
                        <button
                          type="button"
                          onClick={() => setEditingId(isEditing ? null : resp.reviewId)}
                          className="text-xs text-branvidia-800 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>{isEditing ? 'Done Editing' : 'Edit Draft'}</span>
                        </button>
                      </div>

                      {isEditing ? (
                        <textarea
                          rows={3}
                          value={currentText}
                          onChange={(e) => handleTextChange(resp.reviewId, e.target.value)}
                          className="w-full text-xs font-sans text-charcoal-900 bg-white border border-paper-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-branvidia-700 leading-relaxed"
                        />
                      ) : (
                        <p className="text-xs font-sans text-charcoal-900 leading-relaxed font-medium">
                          {currentText}
                        </p>
                      )}

                      <div className="flex justify-end pt-1">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleCopy(resp.reviewId, currentText)}
                          className="flex-shrink-0 text-xs gap-1.5 h-8 px-3"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700">Copied to Clipboard</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-charcoal-500" />
                              <span>Copy Reply Text</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Rationale Footer */}
                    <div className="flex items-center justify-between text-[11px] text-charcoal-500 pt-1">
                      <span>Strategic Rationale: {resp.rationale}</span>
                      <span className="text-[10px] font-mono text-charcoal-400">1-click copy ready</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
