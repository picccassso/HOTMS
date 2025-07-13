import { useState, useCallback, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import type { View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, startOfDay, addDays } from 'date-fns';
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

// Custom view type for today-first week
const TODAY_FIRST = 'today_first' as const;

// Extended Views with our custom view
const ExtendedViews = {
  ...Views,
  TODAY_FIRST,
} as const;

type ExtendedView = View | typeof TODAY_FIRST;

// Create a custom localizer that can handle today-first week
const createCustomLocalizer = (currentView: ExtendedView) => {
  return dateFnsLocalizer({
    format,
    parse,
    startOfWeek: (date: Date) => {
      if (currentView === TODAY_FIRST) {
        // For today-first view, start the week from the current date
        return startOfDay(date);
      }
      return startOfWeek(date);
    },
    getDay,
    locales,
  });
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
  const [view, setView] = useState<ExtendedView>(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [showNewReservationDialog, setShowNewReservationDialog] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [showReservationDetails, setShowReservationDetails] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  // Calculate the effective date for calendar display
  const effectiveDate = useMemo(() => {
    if (view === TODAY_FIRST) {
      // For today-first view, ensure we're showing a week that starts with the current date
      return startOfDay(date);
    }
    return date;
  }, [view, date]);

  // Get the appropriate localizer for the current view
  const currentLocalizer = useMemo(() => {
    return view === TODAY_FIRST ? createCustomLocalizer(view) : localizer;
  }, [view]);

  // Convert reservations to calendar events
  const events: CalendarEvent[] = useMemo(() => {
    return reservations.map((reservation) => ({
      id: reservation.id,
      title: `${reservation.guest?.full_name || 'Guest Deleted'} - Room ${reservation.room?.room_number || 'Room Deleted'}`,
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
    if (view === TODAY_FIRST) {
      // For today-first view, navigation moves in 7-day increments
      const today = startOfDay(new Date());
      const currentStart = startOfDay(date);
      const daysDiff = Math.round((newDate.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24));
      
      // Move by weeks (7 days) from current position
      if (daysDiff > 0) {
        setDate(addDays(currentStart, 7)); // Next week
      } else if (daysDiff < 0) {
        setDate(addDays(currentStart, -7)); // Previous week
      } else {
        setDate(today); // Today button
      }
    } else {
      setDate(newDate);
    }
  }, [view, date]);

  const handleViewChange = useCallback((newView: ExtendedView) => {
    setView(newView);
    if (newView === TODAY_FIRST) {
      // When switching to today-first view, start from today
      setDate(startOfDay(new Date()));
    }
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
      <div className="bg-card border border-border rounded-lg shadow-lg p-5 overflow-hidden transition-shadow duration-200 hover:shadow-xl">
        <Calendar
          localizer={currentLocalizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          view={view === TODAY_FIRST ? Views.WEEK : view}
          views={[Views.MONTH, Views.WEEK, Views.DAY, TODAY_FIRST, Views.AGENDA]}
          messages={{
            [TODAY_FIRST]: 'Today First',
          }}
          date={effectiveDate}
          onNavigate={handleNavigate}
          onView={handleViewChange}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          selectable={true}
          eventPropGetter={eventStyleGetter}
          popup={true}
          // Custom date range for today-first view
          {...(view === TODAY_FIRST && {
            formats: {
              dayHeaderFormat: (date: Date, culture?: string, localizer?: any) => {
                const today = startOfDay(new Date());
                const daysDiff = Math.round((startOfDay(date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                
                if (daysDiff === 0) return 'Today';
                if (daysDiff === 1) return 'Tomorrow';
                if (daysDiff === -1) return 'Yesterday';
                
                return format(date, 'EEE dd', { locale: enUS });
              }
            }
          })}
          tooltipAccessor={(event: CalendarEvent) => {
            const reservation = event.resource;
            return `${reservation.guest?.full_name || 'Guest Deleted'} - Room ${reservation.room?.room_number || 'Room Deleted'}\nStatus: ${reservation.status}\nDates: ${format(new Date(reservation.start_date), 'MMM dd')} - ${format(new Date(reservation.end_date), 'MMM dd')}`;
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