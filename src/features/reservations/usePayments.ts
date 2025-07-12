import { useState, useEffect } from 'react';
import { getReservationPayments, createPayment } from './api';
import type { Payment, PaymentCreate } from '@/types/schemas';

export const usePayments = (reservationId?: string) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPayments = async (resId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getReservationPayments(resId);
      setPayments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const addPayment = async (paymentData: PaymentCreate) => {
    try {
      const newPayment = await createPayment(paymentData);
      setPayments(prev => [...prev, newPayment]);
      return newPayment;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create payment');
    }
  };

  useEffect(() => {
    if (reservationId) {
      loadPayments(reservationId);
    }
  }, [reservationId]);

  return {
    payments,
    loading,
    error,
    addPayment,
    refetch: () => reservationId ? loadPayments(reservationId) : Promise.resolve()
  };
};