import { useState, useEffect } from 'react';
import { getReservations, createReservation, updateReservation, deleteReservation, getReservationsByDateRange } from './api';
import type { Reservation, ReservationCreate, ReservationUpdate } from '@/types/schemas';

export const useReservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getReservations();
      setReservations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  const addReservation = async (reservationData: ReservationCreate) => {
    try {
      const newReservation = await createReservation(reservationData);
      setReservations(prev => [...prev, newReservation]);
      return newReservation;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create reservation');
    }
  };

  const editReservation = async (id: string, reservationData: ReservationUpdate) => {
    try {
      const updatedReservation = await updateReservation(id, reservationData);
      setReservations(prev => prev.map(reservation => 
        reservation.id === id ? updatedReservation : reservation
      ));
      return updatedReservation;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update reservation');
    }
  };

  const removeReservation = async (id: string) => {
    try {
      await deleteReservation(id);
      setReservations(prev => prev.filter(reservation => reservation.id !== id));
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete reservation');
    }
  };

  const loadReservationsByDateRange = async (startDate: string, endDate: string) => {
    try {
      return await getReservationsByDateRange(startDate, endDate);
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to load reservations by date range');
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  return {
    reservations,
    loading,
    error,
    addReservation,
    editReservation,
    removeReservation,
    loadReservationsByDateRange,
    refetch: loadReservations
  };
};