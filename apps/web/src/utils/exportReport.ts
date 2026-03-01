import type { CredibilityScore, Evidence, LedgerEntry } from '../types';
import { formatCurrency, formatDate } from './formatters';

interface ExportData {
  businessName: string;
  score: CredibilityScore;
  evidence: Evidence[];
  ledgerEntries: LedgerEntry[];
  generatedAt: string;
  validUntil: string;
}

export function exportAsCSV(data: ExportData): void {
  const { businessName, score, ledgerEntries, generatedAt } = data;
  
  // Create CSV content
  const headers = ['Date', 'Type', 'Channel', 'Amount', 'Confidence'];
  const rows = ledgerEntries.map(entry => [
    formatDate(new Date(entry.event_time)),
    entry.event_type,
    entry.channel,
    entry.amount.toString(),
    (entry.confidence * 100).toFixed(0) + '%'
  ]);
  
  const csvContent = [
    `Business Name: ${businessName}`,
    `Credibility Score: ${score.score}`,
    `Generated: ${formatDate(new Date(generatedAt))}`,
    '',
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  // Download file
  downloadFile(csvContent, `${businessName}-report-${Date.now()}.csv`, 'text/csv');
}

export function exportAsJSON(data: ExportData): void {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, `${data.businessName}-report-${Date.now()}.json`, 'application/json');
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
