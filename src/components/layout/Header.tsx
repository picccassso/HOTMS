// src/components/layout/Header.tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase';
import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Header() {
  const navigate = useNavigate();
  const [hotelName, setHotelName] = useState<string>('Hotel');

  useEffect(() => {
    const fetchHotelName = async () => {
      const { data, error } = await supabase
        .from('hotel_settings')
        .select('name')
        .limit(1)
        .single();
      
      if (!error && data) {
        setHotelName(data.name);
      }
    };
    fetchHotelName();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <header className="bg-card border-b border-border px-6 py-4 shadow-hotel">
      <div className="flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">H</span>
            </div>
            <div className="text-xl font-bold tracking-tight">
              <span className="text-foreground">HOTMS</span>
              <span className="text-muted-foreground mx-2">|</span>
              <span className="text-muted-foreground font-medium">{hotelName}</span>
            </div>
          </div>
        </div>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <User className="h-5 w-5" />
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm text-muted-foreground">Signed in as</p>
              <p className="text-sm font-medium">admin@grandhotel.com</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}