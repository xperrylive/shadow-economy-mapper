import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

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
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Use only onAuthStateChange which emits INITIAL_SESSION on first call
    // This avoids the double-fire from calling both getSession() and onAuthStateChange
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      const newUserId = newSession?.user?.id ?? null;

      // Always update session (for fresh tokens)
      setSession(newSession);

      // Only update user state if the user actually changed (by ID),
      // not on token refreshes which create new object references
      if (newUserId !== userIdRef.current) {
        userIdRef.current = newUserId;
        setUser(newSession?.user ?? null);
      }

      if (!initializedRef.current) {
        initializedRef.current = true;
        setLoading(false);
      }
    });

    // Fallback: if onAuthStateChange doesn't fire within 2s, stop loading
    const timeout = setTimeout(() => {
      if (!initializedRef.current) {
        initializedRef.current = true;
        setLoading(false);
      }
    }, 2000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {!loading && children}
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
