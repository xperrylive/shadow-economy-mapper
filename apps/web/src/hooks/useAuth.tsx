import { createContext, useContext, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';

// ── DEV BYPASS: Remove this block and restore Supabase auth when ready ──
const DEV_BYPASS_AUTH = true;

const MOCK_USER = {
  id: 'dev-user-001',
  email: 'dev@shadowecon.local',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
} as unknown as User;

const MOCK_SESSION = {
  access_token: 'dev-token',
  refresh_token: 'dev-refresh',
  user: MOCK_USER,
  expires_at: Date.now() / 1000 + 86400,
} as unknown as Session;
// ── END DEV BYPASS ──

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user] = useState<User | null>(DEV_BYPASS_AUTH ? MOCK_USER : null);
  const [session] = useState<Session | null>(DEV_BYPASS_AUTH ? MOCK_SESSION : null);
  const [loading] = useState(false);

  const signIn = async (_email: string, _password: string) => {
    // No-op in dev bypass
  };

  const signUp = async (_email: string, _password: string) => {
    // No-op in dev bypass
  };

  const signOut = async () => {
    // No-op in dev bypass
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
