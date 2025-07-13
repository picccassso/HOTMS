// src/components/auth/ProtectedRoute.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/services/supabase';
import type { Session } from '@supabase/supabase-js';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [setupComplete, setSetupComplete] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndSetup = async () => {
      // First check authentication
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        navigate('/login');
        return;
      }
      
      setSession(sessionData.session);
      
      // Then check setup completion
      const { data: ownerData, error } = await supabase
        .from('owner_profile')
        .select('id')
        .limit(1);
      
      if (error) {
        console.warn('Setup check error:', error.message);
        setSetupComplete(false);
        return;
      }
      
      const isSetupComplete = ownerData && ownerData.length > 0;
      setSetupComplete(isSetupComplete);
      
      // If authenticated but setup not complete, redirect to setup
      if (!isSetupComplete) {
        navigate('/setup');
      }
    };
    
    checkAuthAndSetup();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/login');
        setSession(null);
        setSetupComplete(null);
      } else {
        setSession(session);
        // Re-check setup when auth state changes
        checkAuthAndSetup();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  // Show loading while checking auth and setup
  if (session === null || setupComplete === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Only render children if authenticated and setup is complete
  return session && setupComplete ? children : null;
}