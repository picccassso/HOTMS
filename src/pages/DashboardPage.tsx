import { useMemo } from 'react';
import { format, isToday } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useReservations } from '@/features/reservations/useReservations';
import { useRooms } from '@/features/rooms/useRooms';
import { useGuests } from '@/features/guests/useGuests';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { reservations, loading: reservationsLoading } = useReservations();
  const { rooms, loading: roomsLoading } = useRooms();
  const { guests, loading: guestsLoading } = useGuests();
  
  const loading = reservationsLoading || roomsLoading || guestsLoading;

  // Calculate today's data
  const todaysData = useMemo(() => {
    const today = new Date();
    
    const arrivals = reservations.filter(reservation => 
      isToday(new Date(reservation.start_date)) && 
      reservation.status !== 'cancelled'
    );
    
    const departures = reservations.filter(reservation => 
      isToday(new Date(reservation.end_date)) && 
      reservation.status !== 'cancelled'
    );
    
    const currentGuests = reservations.filter(reservation => {
      const startDate = new Date(reservation.start_date);
      const endDate = new Date(reservation.end_date);
      return startDate <= today && endDate >= today && 
             reservation.status === 'checked_in';
    });
    
    const pendingCheckIns = arrivals.filter(r => r.status === 'confirmed');
    const pendingCheckOuts = departures.filter(r => r.status === 'checked_in');
    
    return {
      arrivals,
      departures,
      currentGuests,
      pendingCheckIns,
      pendingCheckOuts
    };
  }, [reservations]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalRooms = rooms.filter(room => room.is_active).length;
    const occupiedRooms = todaysData.currentGuests.length;
    const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;
    
    // Calculate today's revenue (from confirmed/completed reservations)
    const todaysRevenue = reservations
      .filter(r => isToday(new Date(r.start_date)) && r.status !== 'cancelled')
      .reduce((sum, r) => sum + (r.room?.rate || 0), 0);

    return {
      totalRooms,
      occupiedRooms,
      occupancyRate,
      todaysRevenue,
      totalGuests: guests.length,
      totalReservations: reservations.length
    };
  }, [rooms, todaysData.currentGuests, reservations, guests]);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="space-y-2 pb-6 border-b border-border/20">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-lg">Loading your hotel overview...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card border border-border/20 rounded-lg shadow-md p-6 transition-shadow duration-200 hover:shadow-lg animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-2 pb-6 border-b border-border">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
            <p className="text-muted-foreground text-lg">
              Welcome back! Here's what's happening at your hotel today.
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            {format(new Date(), 'EEEE, MMMM do, yyyy')}
          </div>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card border border-border rounded-lg shadow-lg p-6 text-center space-y-2 transition-shadow duration-200 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Occupancy Rate</p>
              <p className="text-3xl font-bold text-primary">
                {stats.occupancyRate.toFixed(0)}%
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-primary" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {stats.occupiedRooms} of {stats.totalRooms} rooms occupied
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg shadow-lg p-6 text-center space-y-2 transition-shadow duration-200 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Today's Revenue</p>
              <p className="text-3xl font-bold text-green-600">
                ${stats.todaysRevenue.toFixed(0)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            From {todaysData.arrivals.length} new bookings
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg shadow-lg p-6 text-center space-y-2 transition-shadow duration-200 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Guests</p>
              <p className="text-3xl font-bold text-blue-600">
                {stats.totalGuests}
              </p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            In guest database
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg shadow-lg p-6 text-center space-y-2 transition-shadow duration-200 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending Actions</p>
              <p className="text-3xl font-bold text-orange-600">
                {todaysData.pendingCheckIns.length + todaysData.pendingCheckOuts.length}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-600" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Check-ins & check-outs
          </p>
        </div>
      </div>

      {/* Today's Focus */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Arrivals */}
        <div className="bg-card border border-border rounded-lg shadow-lg p-6 transition-shadow duration-200 hover:shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <UserCheck className="h-5 w-5 mr-2 text-green-600" />
              Today's Arrivals
            </h3>
            <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
              {todaysData.arrivals.length}
            </span>
          </div>
          
          <div className="space-y-3">
            {todaysData.arrivals.length === 0 ? (
              <p className="text-muted-foreground text-sm">No arrivals scheduled for today</p>
            ) : (
              todaysData.arrivals.slice(0, 5).map((reservation) => (
                <div key={reservation.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{reservation.guest?.full_name || 'Guest Deleted'}</p>
                    <p className="text-xs text-muted-foreground">
                      Room {reservation.room?.room_number || 'Room Deleted'} • {reservation.room?.room_type || 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      reservation.status === 'confirmed' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {reservation.status === 'confirmed' ? 'Pending' : 'Checked In'}
                    </span>
                  </div>
                </div>
              ))
            )}
            {todaysData.arrivals.length > 5 && (
              <p className="text-xs text-muted-foreground text-center pt-2">
                +{todaysData.arrivals.length - 5} more arrivals
              </p>
            )}
          </div>
        </div>

        {/* Current Guests */}
        <div className="bg-card border border-border rounded-lg shadow-lg p-6 transition-shadow duration-200 hover:shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              Current Guests
            </h3>
            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {todaysData.currentGuests.length}
            </span>
          </div>
          
          <div className="space-y-3">
            {todaysData.currentGuests.length === 0 ? (
              <p className="text-muted-foreground text-sm">No guests currently checked in</p>
            ) : (
              todaysData.currentGuests.slice(0, 5).map((reservation) => (
                <div key={reservation.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{reservation.guest?.full_name || 'Guest Deleted'}</p>
                    <p className="text-xs text-muted-foreground">
                      Room {reservation.room?.room_number || 'Room Deleted'} • Until {format(new Date(reservation.end_date), 'MMM dd')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Staying
                    </span>
                  </div>
                </div>
              ))
            )}
            {todaysData.currentGuests.length > 5 && (
              <p className="text-xs text-muted-foreground text-center pt-2">
                +{todaysData.currentGuests.length - 5} more guests
              </p>
            )}
          </div>
        </div>

        {/* Departures */}
        <div className="bg-card border border-border rounded-lg shadow-lg p-6 transition-shadow duration-200 hover:shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <UserX className="h-5 w-5 mr-2 text-orange-600" />
              Today's Departures
            </h3>
            <span className="text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
              {todaysData.departures.length}
            </span>
          </div>
          
          <div className="space-y-3">
            {todaysData.departures.length === 0 ? (
              <p className="text-muted-foreground text-sm">No departures scheduled for today</p>
            ) : (
              todaysData.departures.slice(0, 5).map((reservation) => (
                <div key={reservation.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{reservation.guest?.full_name || 'Guest Deleted'}</p>
                    <p className="text-xs text-muted-foreground">
                      Room {reservation.room?.room_number || 'Room Deleted'} • {reservation.room?.room_type || 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      reservation.status === 'checked_in' 
                        ? 'bg-orange-100 text-orange-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {reservation.status === 'checked_in' ? 'Check Out' : 'Completed'}
                    </span>
                  </div>
                </div>
              ))
            )}
            {todaysData.departures.length > 5 && (
              <p className="text-xs text-muted-foreground text-center pt-2">
                +{todaysData.departures.length - 5} more departures
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-lg shadow-lg p-6 transition-shadow duration-200 hover:shadow-xl">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => navigate('/reservations')}
            className="p-4 text-left bg-muted/50 rounded-lg hover:bg-muted transition-colors"
          >
            <Calendar className="h-6 w-6 text-blue-600 mb-2" />
            <p className="font-medium">View Calendar</p>
            <p className="text-xs text-muted-foreground">Check reservations & availability</p>
          </button>
          <button 
            onClick={() => navigate('/reservations')}
            className="p-4 text-left bg-muted/50 rounded-lg hover:bg-muted transition-colors"
          >
            <UserCheck className="h-6 w-6 text-green-600 mb-2" />
            <p className="font-medium">Process Check-ins</p>
            <p className="text-xs text-muted-foreground">{todaysData.pendingCheckIns.length} pending</p>
          </button>
          <button 
            onClick={() => navigate('/reservations')}
            className="p-4 text-left bg-muted/50 rounded-lg hover:bg-muted transition-colors"
          >
            <UserX className="h-6 w-6 text-orange-600 mb-2" />
            <p className="font-medium">Process Check-outs</p>
            <p className="text-xs text-muted-foreground">{todaysData.pendingCheckOuts.length} pending</p>
          </button>
        </div>
      </div>
    </div>
  );
}