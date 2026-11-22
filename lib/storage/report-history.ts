"use client";

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
const MAX_SAVED_REPORTS = 25;

export function getReportHistory(): SavedReportEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error("[storage] Failed to read report history from localStorage:", err);
    return [];
  }
}

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
  const updated = [newEntry, ...existing.filter((e) => e.generatedAt !== entry.generatedAt)].slice(
    0,
    MAX_SAVED_REPORTS
  );

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("[storage] Could not persist report to localStorage (quota exceeded?):", err);
  }

  return newEntry;
}

export function getReportById(id: string): SavedReportEntry | null {
  const all = getReportHistory();
  return all.find((item) => item.id === id) || null;
}

export function deleteReportFromHistory(id: string): void {
  if (typeof window === "undefined") return;
  const existing = getReportHistory();
  const filtered = existing.filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function clearAllReportHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
