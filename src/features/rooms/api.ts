import { supabase } from '@/services/supabase';
import { roomCreateSchema, roomUpdateSchema, type Room, type RoomCreate, type RoomUpdate } from '@/types/schemas';

export const getRooms = async (): Promise<Room[]> => {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .order('room_number');
  
  if (error) throw error;
  return data || [];
};

export const createRoom = async (roomData: RoomCreate): Promise<Room> => {
  const validatedData = roomCreateSchema.parse(roomData);
  
  const { data, error } = await supabase
    .from('rooms')
    .insert(validatedData)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateRoom = async (id: string, roomData: RoomUpdate): Promise<Room> => {
  const validatedData = roomUpdateSchema.parse(roomData);
  
  const { data, error } = await supabase
    .from('rooms')
    .update(validatedData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteRoom = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('rooms')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

export const getActiveRooms = async (): Promise<Room[]> => {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('is_active', true)
    .order('room_number');
  
  if (error) throw error;
  return data || [];
};

export const checkRoomHasReservations = async (roomId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('reservations')
    .select('id')
    .eq('room_id', roomId)
    .not('status', 'in', '(checked_out,cancelled)')
    .limit(1);
  
  if (error) throw error;
  return (data || []).length > 0;
};