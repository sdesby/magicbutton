'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { Session, User } from '@supabase/supabase-js';

type DomainPreference = 'Drawing' | 'Writing' | 'Photography';
export type LevelType = 'Beginner' | 'Intermediate';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    domainPreference?: string,
    level?: LevelType
  ) => Promise<{ error: object | null; data: object | null }>;
  signIn: (email: string, password: string) => Promise<{ error: object | null; data: object | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const setData = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error(error);
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    setData();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    domainPreference?: string,
    level?: LevelType
  ) => {
    // Removed all development logs for production cleanliness
    // Convert domain preference to proper case for enum
    let formattedDomainPreference: DomainPreference | undefined;
    if (domainPreference) {
      // Capitalize first letter to match enum
      const formattedDomain = domainPreference.charAt(0).toUpperCase() + domainPreference.slice(1);
      formattedDomainPreference = formattedDomain as DomainPreference;
      // Removed all development logs for production cleanliness
    }
    // First, create the user in auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          domain_preference: formattedDomainPreference ? [formattedDomainPreference] : [],
          level: level || 'Beginner',
        }
      }
    });
    // Do NOT insert into users table here! Wait until after login.
    return { data, error };
  };

  // Insert user profile on first login if not exists
  useEffect(() => {
    const insertUserProfileIfNeeded = async () => {
      if (!user) return;
      // Check if user row exists
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();
      if (!existing) {
        // Insert user profile row
        const meta = user.user_metadata || {};
        const { error: insertError } = await supabase.from('users').insert([
          {
            id: user.id,
            first_name: meta.first_name,
            last_name: meta.last_name,
            email: user.email,
            domain_preference: meta.domain_preference,
            level: meta.level,
          }
        ]);
        if (insertError) {
          console.error('Error inserting user profile on first login:', insertError);
        }
      }
    };
    insertUserProfileIfNeeded();
  }, [user]);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    isLoading,
    signUp,
    signIn,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
