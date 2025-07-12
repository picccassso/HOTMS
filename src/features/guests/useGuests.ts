import { useState, useEffect } from 'react';
import { getGuests, createGuest, updateGuest, deleteGuest, searchGuestsByName, searchGuestsByEmail } from './api';
import type { Guest, GuestCreate, GuestUpdate } from '@/types/schemas';

export const useGuests = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGuests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getGuests();
      setGuests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load guests');
    } finally {
      setLoading(false);
    }
  };

  const addGuest = async (guestData: GuestCreate) => {
    try {
      const newGuest = await createGuest(guestData);
      setGuests(prev => [...prev, newGuest]);
      return newGuest;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create guest');
    }
  };

  const editGuest = async (id: string, guestData: GuestUpdate) => {
    try {
      const updatedGuest = await updateGuest(id, guestData);
      setGuests(prev => prev.map(guest => guest.id === id ? updatedGuest : guest));
      return updatedGuest;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update guest');
    }
  };

  const removeGuest = async (id: string) => {
    try {
      await deleteGuest(id);
      setGuests(prev => prev.filter(guest => guest.id !== id));
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete guest');
    }
  };

  const searchGuests = async (searchTerm: string, searchType: 'name' | 'email' = 'name') => {
    try {
      if (searchType === 'email') {
        return await searchGuestsByEmail(searchTerm);
      } else {
        return await searchGuestsByName(searchTerm);
      }
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to search guests');
    }
  };

  useEffect(() => {
    loadGuests();
  }, []);

  return {
    guests,
    loading,
    error,
    addGuest,
    editGuest,
    removeGuest,
    searchGuests,
    refetch: loadGuests
  };
};