// src/types/auth.ts
import { User, Session } from '@supabase/supabase-js';

export type AuthUserProfile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  preferences: {
    language: string;
    theme: string;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
};

export type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: AuthUserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<AuthUserProfile>) => Promise<{ error: any }>;
  refreshSession: () => Promise<void>;
};