// src/components/layout/Footer.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/services/supabase';
import { format } from 'date-fns';

type HotelSettings = { current_app_version: string; last_successful_backup_at: string | null };

export default function Footer() {
  const [settings, setSettings] = useState<HotelSettings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from('hotel_settings')
        .select('current_app_version, last_successful_backup_at')
        .limit(1)
        .single();
      if (!error) setSettings(data);
    };
    fetchSettings();
  }, []);

  const formattedBackupDate = settings?.last_successful_backup_at
    ? format(new Date(settings.last_successful_backup_at), 'yyyy-MM-dd HH:mm:ss zzz')
    : 'Never';

  return (
    <footer style={{ padding: '0.5rem', borderTop: '1px solid #ccc', textAlign: 'center' }}>
      <p>
        Version: {settings?.current_app_version || 'N/A'} | Last Backup: {formattedBackupDate}
      </p>
    </footer>
  );
}