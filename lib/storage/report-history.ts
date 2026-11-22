"use client";

/**
 * ============================================================================
 * BRANVIDIA AUDIT REPORT HISTORY — BROWSER LOCAL STORAGE
 * ============================================================================
 * ARCHITECTURAL NOTICE:
 * This module persists generated audit reports exclusively within the user's
 * client-side browser `localStorage`.
 *
 * SCOPE & LIMITATIONS:
 * 1. Client-Side Only: Reports are NOT synchronized to an external cloud database.
 * 2. Device Bound: Reports saved on this device/browser are not accessible from
 *    other devices or browsers.
 * 3. Quota Managed: Storage is restricted to the 20 most recent reports to respect
 *    browser quota ceilings (~5MB total domain limit). Older entries are pruned
 *    gracefully if storage limits are approached.
 * ============================================================================
 */

import type { AIReportOutput } from "@/lib/ai/schemas";

export interface SavedReportEntry {
  id: string;
  generatedAt: string;
  businessName: string;
  category: string;
  optimizationScore: number;
  scoreGrade: string;
  scoreGradeLabel: string;
  reviewCount: number;
  photoCount: number;
  dataSource: "demo" | "live" | "customer";
  providerLabel: string;
  isFallback: boolean;
  report: AIReportOutput;
}

const STORAGE_KEY = "branvidia_report_history_v1";
const MAX_SAVED_REPORTS = 20;

/**
 * Retrieve saved reports from local browser storage.
 * Handles corrupted JSON or restricted storage safely.
 */
export function getReportHistory(): SavedReportEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.warn("[storage] Corrupted report history in localStorage; resetting.");
      return [];
    }
    // Filter out corrupted individual items
    return parsed.filter(
      (item) => item && typeof item === "object" && typeof item.id === "string" && item.report
    );
  } catch (err) {
    console.warn("[storage] Could not access localStorage (cookies disabled or private browsing?):", err);
    return [];
  }
}

/**
 * Save a newly generated report to local browser storage.
 * Prunes older entries if quota limits are approached.
 */
export function saveReportToHistory(entry: Omit<SavedReportEntry, "id">): SavedReportEntry {
  if (typeof window === "undefined") {
    return { ...entry, id: `rep_${Date.now()}` };
  }

  const existing = getReportHistory();
  const newEntry: SavedReportEntry = {
    ...entry,
    id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
  };

  // Prepend newest report and limit total size
  let updated = [newEntry, ...existing.filter((e) => e.generatedAt !== entry.generatedAt)].slice(
    0,
    MAX_SAVED_REPORTS
  );

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err: any) {
    // If quota exceeded, prune older reports and retry once
    console.warn("[storage] localStorage write failed, attempting aggressive prune:", err?.message);
    try {
      updated = [newEntry, ...existing.slice(0, 5)];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (retryErr) {
      console.error("[storage] localStorage completely exhausted; report cannot be cached locally:", retryErr);
    }
  }

  return newEntry;
}

export function getReportById(id: string): SavedReportEntry | null {
  const all = getReportHistory();
  return all.find((item) => item.id === id) || null;
}

export function deleteReportFromHistory(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getReportHistory();
    const filtered = existing.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error("[storage] Failed to delete report from localStorage:", err);
  }
}

export function clearAllReportHistory(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error("[storage] Failed to clear report history from localStorage:", err);
  }
}
