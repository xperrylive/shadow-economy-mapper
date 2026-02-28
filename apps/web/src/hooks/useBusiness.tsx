import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
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
  const currentBusinessRef = useRef(currentBusiness);

  // Keep ref in sync without triggering re-renders
  currentBusinessRef.current = currentBusiness;

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
      if (data.length > 0 && !currentBusinessRef.current) {
        // Only set current business if none is selected
        setCurrentBusiness(data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch businesses:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refresh();
    } else {
      setBusinesses([]);
      setCurrentBusiness(null);
      setLoading(false);
    }
  }, [user, refresh]);

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
