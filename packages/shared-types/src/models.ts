/**
 * Shadow Economy Mapper — Shared Types
 *
 * THIS IS THE CONTRACT. Everyone imports from here.
 * Changes require team approval via PR.
 *
 * Python equivalents:
 *   - packages/extraction/src/types.py
 *   - packages/scoring/src/types.py
 */

// ─── Enums ───────────────────────────────────────────────

export type EvidenceStatus =
  | "UPLOADED"
  | "QUEUED"
  | "EXTRACTED"
  | "NORMALIZED"
  | "ANALYZED"
  | "REPORTED"
  | "FAILED";

export type SourceType =
  | "whatsapp"
  | "telegram"
  | "instagram"
  | "csv_grab"
  | "csv_shopee"
  | "csv_foodpanda"
  | "pdf_bank"
  | "pdf_ewallet"
  | "screenshot"
  | "manual"
  | "voice";

export type EventType = "order" | "payment" | "payout" | "refund";

export type Channel =
  | "whatsapp"
  | "grabfood"
  | "shopee"
  | "foodpanda"
  | "lazada"
  | "tng"
  | "bank"
  | "cash"
  | "other";

export type ConfidenceLevel = "LOW" | "MEDIUM" | "HIGH";

// ─── Core Models ─────────────────────────────────────────

export interface BusinessProfile {
  id: string;
  name: string;
  category: string;
  location: string;
  channels: Channel[];
  created_at: string;
  updated_at: string;
}

export interface Evidence {
  id: string;
  business: string;
  source_type: SourceType;
  file_url: string;
  original_filename: string;
  file_size: number;
  status: EvidenceStatus;
  error_message: string;
  metadata: Record<string, unknown>;
  uploaded_at: string;
  processed_at: string | null;
}

export interface LedgerEntry {
  id: string;
  business: string;
  event_time: string;
  amount: number;
  currency: string;
  channel: Channel;
  event_type: EventType;
  source_evidence: string;
  confidence: number;
  attributes: Record<string, unknown>;
  created_at: string;
}

export interface ScoreBreakdown {
  activity: number;
  consistency: number;
  longevity: number;
  evidence_strength: number;
  cross_source: number;
  penalties: number;
}

export interface CredibilityScore {
  id: string;
  business: string;
  score: number;
  confidence_level: ConfidenceLevel;
  breakdown: ScoreBreakdown;
  flags: string[];
  insights: InsightCard[];
  computed_at: string;
}

export interface InsightCard {
  type: "peak_day" | "trend" | "recommendation" | "coverage";
  title: string;
  description: string;
  data?: Record<string, unknown>;
}

export interface Report {
  id: string;
  business: string;
  report_type: "sme" | "verifier";
  pdf_url: string;
  data_snapshot: Record<string, unknown>;
  created_at: string;
}

export interface ShareToken {
  token: string;
  share_url: string;
  expires_at: string;
}

// ─── API Request/Response Types ──────────────────────────

export interface UploadEvidenceRequest {
  business_id: string;
  source_type: SourceType;
  file?: File;
  date?: string;
  total_sales?: number;
  order_count?: number;
  notes?: string;
}

export interface UploadEvidenceResponse {
  evidence_id: string;
  status: EvidenceStatus;
  message: string;
}

export interface GetLedgerParams {
  business_id: string;
  from?: string;
  to?: string;
  channel?: Channel;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface GenerateReportRequest {
  business_id: string;
  report_type: "sme" | "verifier";
}

export interface GenerateReportResponse {
  message: string;
  business_id: string;
}

export interface ApiError {
  error: true;
  message: string;
  details?: Record<string, unknown>;
}
