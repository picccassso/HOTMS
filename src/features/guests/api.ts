import { supabase } from '@/services/supabase';
import { guestCreateSchema, guestUpdateSchema, type Guest, type GuestCreate, type GuestUpdate } from '@/types/schemas';

export const getGuests = async (): Promise<Guest[]> => {
  const { data, error } = await supabase
    .from('guests')
    .select('*')
    .order('full_name');
  
  if (error) throw error;
  return data || [];
};

export const createGuest = async (guestData: GuestCreate): Promise<Guest> => {
  const validatedData = guestCreateSchema.parse(guestData);
  
  const { data, error } = await supabase
    .from('guests')
    .insert(validatedData)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateGuest = async (id: string, guestData: GuestUpdate): Promise<Guest> => {
  const validatedData = guestUpdateSchema.parse(guestData);
  
  const { data, error } = await supabase
    .from('guests')
    .update(validatedData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteGuest = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('guests')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

export const searchGuestsByName = async (searchTerm: string): Promise<Guest[]> => {
  const { data, error } = await supabase
    .from('guests')
    .select('*')
    .ilike('full_name', `%${searchTerm}%`)
    .order('full_name')
    .limit(10);
  
  if (error) throw error;
  return data || [];
};

export const searchGuestsByEmail = async (email: string): Promise<Guest[]> => {
  const { data, error } = await supabase
    .from('guests')
    .select('*')
    .ilike('email', `%${email}%`)
    .order('full_name')
    .limit(10);
  
  if (error) throw error;
  return data || [];
};

export const checkGuestHasReservations = async (guestId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('reservations')
    .select('id')
    .eq('guest_id', guestId)
    .not('status', 'in', '(checked_out,cancelled)')
    .limit(1);
  
  if (error) throw error;
  return (data || []).length > 0;
};