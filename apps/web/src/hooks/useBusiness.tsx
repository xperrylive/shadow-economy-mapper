import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { BusinessProfile } from '../types';

// ── DEV BYPASS: Remove and restore API calls when backend is ready ──
const DEV_BYPASS_BUSINESS = true;

const MOCK_BUSINESS: BusinessProfile = {
  id: 'biz-001',
  name: "Kak Lina's Kuih",
  category: 'food_home',
  location: 'Shah Alam, Selangor',
  channels: ['whatsapp', 'grabfood', 'cash'],
  created_at: '2026-01-15T08:00:00Z',
  updated_at: '2026-02-20T10:00:00Z',
};
// ── END DEV BYPASS ──

interface BusinessContextType {
  businesses: BusinessProfile[];
  currentBusiness: BusinessProfile | null;
  setCurrentBusiness: (b: BusinessProfile) => void;
  loading: boolean;
  refresh: () => Promise<void>;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const [businesses] = useState<BusinessProfile[]>(
    DEV_BYPASS_BUSINESS ? [MOCK_BUSINESS] : []
  );
  const [currentBusiness, setCurrentBusiness] = useState<BusinessProfile | null>(
    DEV_BYPASS_BUSINESS ? MOCK_BUSINESS : null
  );
  const [loading] = useState(false);

  const refresh = useCallback(async () => {
    // No-op in dev bypass
  }, []);

  return (
    <BusinessContext.Provider value={{ businesses, currentBusiness, setCurrentBusiness, loading, refresh }}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
}
