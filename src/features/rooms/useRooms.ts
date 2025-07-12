import { useState, useEffect } from 'react';
import { getRooms, createRoom, updateRoom, deleteRoom } from './api';
import type { Room, RoomCreate, RoomUpdate } from '@/types/schemas';

export const useRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRooms();
      setRooms(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const addRoom = async (roomData: RoomCreate) => {
    try {
      const newRoom = await createRoom(roomData);
      setRooms(prev => [...prev, newRoom]);
      return newRoom;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create room');
    }
  };

  const editRoom = async (id: string, roomData: RoomUpdate) => {
    try {
      const updatedRoom = await updateRoom(id, roomData);
      setRooms(prev => prev.map(room => room.id === id ? updatedRoom : room));
      return updatedRoom;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update room');
    }
  };

  const removeRoom = async (id: string) => {
    try {
      await deleteRoom(id);
      setRooms(prev => prev.filter(room => room.id !== id));
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete room');
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  return {
    rooms,
    loading,
    error,
    addRoom,
    editRoom,
    removeRoom,
    refetch: loadRooms
  };
};