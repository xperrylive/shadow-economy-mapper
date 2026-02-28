import { api } from './api';
import type {
  BusinessProfile,
  Evidence,
  LedgerEntry,
  CredibilityScore,
  Report,
  ShareToken,
  ConsentSettings,
  PaginatedResponse,
  UploadEvidenceResponse,
  GenerateReportResponse,
  VerifyReportResponse,
  SourceType,
  Channel,
} from '../types';

// ─── Business Profiles ───────────────────────────────────

export async function getBusinesses(): Promise<BusinessProfile[]> {
  const { data } = await api.get<BusinessProfile[]>('/auth/businesses/');
  return data;
}

export async function createBusiness(payload: {
  name: string;
  category: string;
  location: string;
  channels: Channel[];
}): Promise<BusinessProfile> {
  const { data } = await api.post<BusinessProfile>('/auth/businesses/', payload);
  return data;
}

export async function updateBusiness(
  id: string,
  payload: Partial<{ name: string; category: string; location: string; channels: Channel[] }>
): Promise<BusinessProfile> {
  const { data } = await api.patch<BusinessProfile>(`/auth/businesses/${id}/`, payload);
  return data;
}

export async function getConsent(businessId: string): Promise<ConsentSettings> {
  const { data } = await api.get<ConsentSettings>(`/auth/businesses/${businessId}/consent/`);
  return data;
}

export async function updateConsent(
  businessId: string,
  payload: Partial<ConsentSettings>
): Promise<ConsentSettings> {
  const { data } = await api.patch<ConsentSettings>(`/auth/businesses/${businessId}/consent/`, payload);
  return data;
}

// ─── Evidence ────────────────────────────────────────────

export async function getEvidenceList(
  businessId?: string
): Promise<PaginatedResponse<Evidence>> {
  const params = businessId ? { business_id: businessId } : {};
  const { data } = await api.get<PaginatedResponse<Evidence>>('/evidence/items/', { params });
  return data;
}

export async function getEvidenceDetail(id: string): Promise<Evidence> {
  const { data } = await api.get<Evidence>(`/evidence/items/${id}/`);
  return data;
}

export async function uploadEvidence(
  businessId: string,
  sourceType: SourceType,
  file: File,
  onProgress?: (percent: number) => void
): Promise<UploadEvidenceResponse> {
  const formData = new FormData();
  formData.append('business_id', businessId);
  formData.append('source_type', sourceType);
  formData.append('file', file);

  const { data } = await api.post<UploadEvidenceResponse>(
    '/evidence/items/upload/',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded * 100) / e.total));
        }
      },
    }
  );
  return data;
}

export async function uploadManualEntry(payload: {
  business_id: string;
  source_type: 'manual';
  date: string;
  total_sales: number;
  order_count?: number;
  notes?: string;
}): Promise<UploadEvidenceResponse> {
  const { data } = await api.post<UploadEvidenceResponse>('/evidence/items/upload/', payload);
  return data;
}

// ─── Ledger ──────────────────────────────────────────────

export async function getLedger(params: {
  business_id: string;
  from?: string;
  to?: string;
  channel?: Channel;
  page?: number;
}): Promise<PaginatedResponse<LedgerEntry>> {
  const { data } = await api.get<PaginatedResponse<LedgerEntry>>('/evidence/ledger/', { params });
  return data;
}

// ─── Scoring ─────────────────────────────────────────────

export async function getScores(
  businessId?: string
): Promise<PaginatedResponse<CredibilityScore>> {
  const params = businessId ? { business_id: businessId } : {};
  const { data } = await api.get<PaginatedResponse<CredibilityScore>>('/evidence/scores/', { params });
  return data;
}

export async function getScoreDetail(id: string): Promise<CredibilityScore> {
  const { data } = await api.get<CredibilityScore>(`/evidence/scores/${id}/`);
  return data;
}

export async function computeScore(businessId: string): Promise<{ message: string; business_id: string }> {
  const { data } = await api.post('/evidence/scores/compute/', { business_id: businessId });
  return data;
}

// ─── Reports ─────────────────────────────────────────────

export async function getReports(
  businessId?: string
): Promise<PaginatedResponse<Report>> {
  const params = businessId ? { business_id: businessId } : {};
  const { data } = await api.get<PaginatedResponse<Report>>('/reports/', { params });
  return data;
}

export async function getReportDetail(id: string): Promise<Report> {
  const { data } = await api.get<Report>(`/reports/${id}/`);
  return data;
}

export async function generateReport(
  businessId: string,
  reportType: 'sme' | 'verifier' = 'sme'
): Promise<GenerateReportResponse> {
  const { data } = await api.post<GenerateReportResponse>('/reports/generate/', {
    business_id: businessId,
    report_type: reportType,
  });
  return data;
}

export async function shareReport(
  reportId: string,
  expiresInHours: number = 72
): Promise<ShareToken> {
  const { data } = await api.post<ShareToken>(`/reports/${reportId}/share/`, {
    expires_in_hours: expiresInHours,
  });
  return data;
}

export async function verifyReport(token: string): Promise<VerifyReportResponse> {
  const { data } = await api.get<VerifyReportResponse>(`/reports/verify/${token}/`);
  return data;
}
