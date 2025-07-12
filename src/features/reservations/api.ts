import { supabase } from '@/services/supabase';
import { 
  reservationCreateSchema, 
  reservationUpdateSchema, 
  paymentCreateSchema,
  type Reservation, 
  type ReservationCreate, 
  type ReservationUpdate,
  type Payment,
  type PaymentCreate
} from '@/types/schemas';

export const getReservations = async (): Promise<Reservation[]> => {
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      *,
      guest:guests(*),
      room:rooms(*)
    `)
    .order('start_date');
  
  if (error) throw error;
  return data || [];
};

export const createReservation = async (reservationData: ReservationCreate): Promise<Reservation> => {
  const validatedData = reservationCreateSchema.parse(reservationData);
  
  const { data, error } = await supabase
    .from('reservations')
    .insert(validatedData)
    .select(`
      *,
      guest:guests(*),
      room:rooms(*)
    `)
    .single();
  
  if (error) throw error;
  return data;
};

export const updateReservation = async (id: string, reservationData: ReservationUpdate): Promise<Reservation> => {
  const validatedData = reservationUpdateSchema.parse(reservationData);
  
  const { data, error } = await supabase
    .from('reservations')
    .update(validatedData)
    .eq('id', id)
    .select(`
      *,
      guest:guests(*),
      room:rooms(*)
    `)
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteReservation = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('reservations')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

export const getReservationsByDateRange = async (startDate: string, endDate: string): Promise<Reservation[]> => {
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      *,
      guest:guests(*),
      room:rooms(*)
    `)
    .gte('start_date', startDate)
    .lte('end_date', endDate)
    .order('start_date');
  
  if (error) throw error;
  return data || [];
};

export const getReservationPayments = async (reservationId: string): Promise<Payment[]> => {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('reservation_id', reservationId)
    .order('payment_date');
  
  if (error) throw error;
  return data || [];
};

export const createPayment = async (paymentData: PaymentCreate): Promise<Payment> => {
  const validatedData = paymentCreateSchema.parse({
    ...paymentData,
    payment_date: paymentData.payment_date || new Date().toISOString()
  });
  
  const { data, error } = await supabase
    .from('payments')
    .insert(validatedData)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Simple check-in/check-out functions
export const checkInReservation = async (reservationId: string): Promise<Reservation> => {
  const { data, error } = await supabase
    .from('reservations')
    .update({ status: 'checked_in' })
    .eq('id', reservationId)
    .select(`
      *,
      guest:guests(*),
      room:rooms(*)
    `)
    .single();
  
  if (error) throw error;
  return data;
};

export const checkOutReservation = async (reservationId: string): Promise<Reservation> => {
  const { data, error } = await supabase
    .from('reservations')
    .update({ status: 'checked_out' })
    .eq('id', reservationId)
    .select(`
      *,
      guest:guests(*),
      room:rooms(*)
    `)
    .single();
  
  if (error) throw error;
  return data;
};