import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { BusinessProfile } from '../types';
import { getBusinesses } from '../lib/services';
import { useAuth } from './useAuth';

interface BusinessContextType {
  businesses: BusinessProfile[];
  currentBusiness: BusinessProfile | null;
  setCurrentBusiness: (b: BusinessProfile) => void;
  loading: boolean;
  refresh: () => Promise<void>;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
  const [currentBusiness, setCurrentBusiness] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setBusinesses([]);
      setCurrentBusiness(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await getBusinesses();
      setBusinesses(data);
      if (data.length > 0) {
        // preserve current selection if it still exists, otherwise take first
        const exists = data.find(b => b.id === currentBusiness?.id);
        setCurrentBusiness(exists || data[0]);
      } else {
        setCurrentBusiness(null);
      }
    } catch (err) {
      console.error('Failed to fetch businesses:', err);
    } finally {
      setLoading(false);
    }
  }, [user, currentBusiness?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

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
