// src/components/layout/Sidebar.tsx
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, Bed, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    name: 'Reservations',
    href: '/reservations',
    icon: Calendar,
  },
  {
    name: 'Rooms',
    href: '/rooms',
    icon: Bed,
  },
  {
    name: 'Guests',
    href: '/guests',
    icon: Users,
  },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border shadow-hotel-lg">
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'hotel-nav-item rounded-lg',
                isActive && 'active'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}