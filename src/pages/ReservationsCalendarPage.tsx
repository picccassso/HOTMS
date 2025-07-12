import { useState, useCallback, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import type { View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useReservations } from '@/features/reservations/useReservations';
import { NewReservationDialog } from '@/features/reservations/NewReservationDialog';
import { ReservationDetailsDialog } from '@/features/reservations/ReservationDetailsDialog';
import type { Reservation, ReservationCreate } from '@/types/schemas';

// Setup the localizer for date-fns
const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Custom event interface for the calendar
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Reservation;
}

// Custom styles for different reservation statuses
const eventStyleGetter = (event: CalendarEvent) => {
  const reservation = event.resource;
  let backgroundColor = '#3174ad';
  
  switch (reservation.status) {
    case 'pending':
      backgroundColor = '#f59e0b'; // amber
      break;
    case 'confirmed':
      backgroundColor = '#059669'; // emerald
      break;
    case 'checked_in':
      backgroundColor = '#0284c7'; // sky
      break;
    case 'checked_out':
      backgroundColor = '#6b7280'; // gray
      break;
    case 'cancelled':
      backgroundColor = '#dc2626'; // red
      break;
    default:
      backgroundColor = '#3174ad'; // blue
  }

  return {
    style: {
      backgroundColor,
      borderRadius: '5px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block',
      fontSize: '12px',
      padding: '2px 4px'
    },
  };
};

export default function ReservationsCalendarPage() {
  const { reservations, loading, error, addReservation, refetch } = useReservations();
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [showNewReservationDialog, setShowNewReservationDialog] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [showReservationDetails, setShowReservationDetails] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  // Convert reservations to calendar events
  const events: CalendarEvent[] = useMemo(() => {
    return reservations.map((reservation) => ({
      id: reservation.id,
      title: `${reservation.guest?.full_name || 'Unknown Guest'} - Room ${reservation.room?.room_number || 'N/A'}`,
      start: new Date(reservation.start_date),
      end: new Date(reservation.end_date),
      resource: reservation,
    }));
  }, [reservations]);

  const handleSelectSlot = useCallback(
    ({ start, end }: { start: Date; end: Date }) => {
      setSelectedSlot({ start, end });
      setShowNewReservationDialog(true);
    },
    []
  );

  const handleSelectEvent = useCallback(
    (event: CalendarEvent) => {
      setSelectedReservation(event.resource);
      setShowReservationDetails(true);
    },
    []
  );

  const handleNavigate = useCallback((newDate: Date) => {
    setDate(newDate);
  }, []);

  const handleViewChange = useCallback((newView: View) => {
    setView(newView);
  }, []);

  const handleCreateReservation = useCallback(async (reservationData: ReservationCreate) => {
    try {
      await addReservation(reservationData);
      setSelectedSlot(null);
    } catch (error) {
      console.error('Failed to create reservation:', error);
      throw error; // Re-throw to let the form handle it
    }
  }, [addReservation]);

  const handleReservationUpdate = useCallback(() => {
    refetch();
  }, [refetch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading reservations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2 pb-6 border-b border-border">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Reservations Calendar</h1>
          <p className="text-muted-foreground text-lg">
            Manage your hotel bookings and availability
          </p>
        </div>
      </div>

      {/* Status Legend */}
      <div className="bg-card border border-border rounded-lg shadow-lg p-6 transition-shadow duration-200 hover:shadow-xl">
        <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-amber-500 rounded"></div>
          <span className="text-sm">Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-emerald-600 rounded"></div>
          <span className="text-sm">Confirmed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-sky-600 rounded"></div>
          <span className="text-sm">Checked In</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-500 rounded"></div>
          <span className="text-sm">Checked Out</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-600 rounded"></div>
          <span className="text-sm">Cancelled</span>
        </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-card border border-border rounded-lg shadow-lg p-0 overflow-hidden transition-shadow duration-200 hover:shadow-xl">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600, padding: '20px' }}
          view={view}
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          date={date}
          onNavigate={handleNavigate}
          onView={handleViewChange}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          selectable={true}
          eventPropGetter={eventStyleGetter}
          popup={true}
          tooltipAccessor={(event: CalendarEvent) => {
            const reservation = event.resource;
            return `${reservation.guest?.full_name} - Room ${reservation.room?.room_number}\nStatus: ${reservation.status}\nDates: ${format(new Date(reservation.start_date), 'MMM dd')} - ${format(new Date(reservation.end_date), 'MMM dd')}`;
          }}
          dayPropGetter={(date) => {
            // Highlight weekends with a subtle background
            const day = getDay(date);
            if (day === 0 || day === 6) {
              return {
                style: {
                  backgroundColor: '#f8fafc',
                },
              };
            }
            return {};
          }}
        />
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg shadow-lg p-6 text-center space-y-2 transition-shadow duration-200 hover:shadow-xl">
          <div className="text-2xl font-bold text-amber-600">
            {reservations.filter(r => r.status === 'pending').length}
          </div>
          <div className="text-sm text-muted-foreground">Pending</div>
        </div>
        <div className="bg-card border border-border rounded-lg shadow-lg p-6 text-center space-y-2 transition-shadow duration-200 hover:shadow-xl">
          <div className="text-2xl font-bold text-emerald-600">
            {reservations.filter(r => r.status === 'confirmed').length}
          </div>
          <div className="text-sm text-muted-foreground">Confirmed</div>
        </div>
        <div className="bg-card border border-border rounded-lg shadow-lg p-6 text-center space-y-2 transition-shadow duration-200 hover:shadow-xl">
          <div className="text-2xl font-bold text-sky-600">
            {reservations.filter(r => r.status === 'checked_in').length}
          </div>
          <div className="text-sm text-muted-foreground">Checked In</div>
        </div>
        <div className="bg-card border border-border rounded-lg shadow-lg p-6 text-center space-y-2 transition-shadow duration-200 hover:shadow-xl">
          <div className="text-2xl font-bold text-gray-600">
            {reservations.length}
          </div>
          <div className="text-sm text-muted-foreground">Total</div>
        </div>
      </div>

      {/* New Reservation Dialog */}
      <NewReservationDialog
        open={showNewReservationDialog}
        onOpenChange={(open) => {
          setShowNewReservationDialog(open);
          if (!open) setSelectedSlot(null);
        }}
        onSubmit={handleCreateReservation}
        initialStartDate={selectedSlot?.start}
        initialEndDate={selectedSlot?.end}
      />

      {/* Reservation Details Dialog */}
      <ReservationDetailsDialog
        open={showReservationDetails}
        onOpenChange={(open) => {
          setShowReservationDetails(open);
          if (!open) setSelectedReservation(null);
        }}
        reservation={selectedReservation}
        onReservationUpdate={handleReservationUpdate}
      />
    </div>
  );
}