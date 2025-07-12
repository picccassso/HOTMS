// src/components/layout/MainLayout.tsx
import { Routes, Route } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import RoomsPage from '@/pages/RoomsPage';
import GuestsPage from '@/pages/GuestsPage';
import ReservationsCalendarPage from '@/pages/ReservationsCalendarPage';
import DashboardPage from '@/pages/DashboardPage';

export default function MainLayout() {
  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-6 animate-fade-in">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/reservations" element={<ReservationsCalendarPage />} />
              <Route path="/rooms" element={<RoomsPage />} />
              <Route path="/guests" element={<GuestsPage />} />
              {/* Add other nested routes here in the future */}
            </Routes>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}