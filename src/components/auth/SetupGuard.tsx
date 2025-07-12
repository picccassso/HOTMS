// src/components/auth/SetupGuard.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/services/supabase';

export default function SetupGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [isSetupComplete, setIsSetupComplete] = useState<boolean | null>(null);

  useEffect(() => {
    const checkUsers = async () => {
      // This is a proxy for setup completion. We call it with service_role key to bypass RLS.
      // This is a simplified check. A more robust check would be to query the hotel_settings table.
      const { data, error } = await supabase.from('owner_profile').select('id').limit(1);

      if (error) {
         // Handle error, maybe allow access if RLS error means table is empty.
         console.warn('Assuming setup is not complete due to check error:', error.message);
         setIsSetupComplete(false);
         return;
      }

      if (data && data.length > 0) {
        setIsSetupComplete(true);
        navigate('/');
      } else {
        setIsSetupComplete(false);
      }
    };
    checkUsers();
  }, [navigate]);

  if (isSetupComplete === null) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  return !isSetupComplete ? children : null;
}