import axios from 'axios';
import { supabase } from './supabase';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

// Cache the access token in memory — updated via auth state listener
let cachedToken: string | null = null;

supabase.auth.getSession().then(({ data: { session } }) => {
  cachedToken = session?.access_token ?? null;
});

supabase.auth.onAuthStateChange((_event, session) => {
  cachedToken = session?.access_token ?? null;
});

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000, // 10s timeout so requests don't hang forever
});

// Attach cached Supabase JWT synchronously — no async overhead per request
api.interceptors.request.use((config) => {
  if (cachedToken) {
    config.headers.Authorization = `Bearer ${cachedToken}`;
  }
  return config;
});
