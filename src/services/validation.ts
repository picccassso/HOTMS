import { ZodSchema, ZodError } from 'zod';
import { supabase } from './supabase';
import * as schemas from '../types/schemas';

// Generic validation error class
export class ValidationError extends Error {
  public readonly issues: string[];
  
  constructor(zodError: ZodError) {
    const issues = zodError.issues.map(err => 
      `${err.path.join('.')}: ${err.message}`
    );
    super(`Validation failed: ${issues.join(', ')}`);
    this.name = 'ValidationError';
    this.issues = issues;
  }
}

// Generic validation function
export function validateData<T>(schema: ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError(error);
    }
    throw error;
  }
}

// Safe validation function that returns result object
export function validateDataSafe<T>(schema: ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: string[];
} {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.issues.map(err => 
        `${err.path.join('.')}: ${err.message}`
      );
      return { success: false, errors };
    }
    return { success: false, errors: ['Unknown validation error'] };
  }
}

// Validated database operations for each entity

// Guest operations
export async function createValidatedGuest(guestData: unknown) {
  const validatedData = validateData(schemas.guestCreateSchema, guestData);
  
  const { data, error } = await supabase
    .from('guests')
    .insert(validatedData)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to create guest: ${error.message}`);
  }
  
  return validateData(schemas.guestSchema, data);
}

export async function updateValidatedGuest(id: string, guestData: unknown) {
  const validatedData = validateData(schemas.guestUpdateSchema, guestData);
  
  const { data, error } = await supabase
    .from('guests')
    .update(validatedData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to update guest: ${error.message}`);
  }
  
  return validateData(schemas.guestSchema, data);
}

// Room operations
export async function createValidatedRoom(roomData: unknown) {
  const validatedData = validateData(schemas.roomCreateSchema, roomData);
  
  const { data, error } = await supabase
    .from('rooms')
    .insert(validatedData)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to create room: ${error.message}`);
  }
  
  return validateData(schemas.roomSchema, data);
}

export async function updateValidatedRoom(id: string, roomData: unknown) {
  const validatedData = validateData(schemas.roomUpdateSchema, roomData);
  
  const { data, error } = await supabase
    .from('rooms')
    .update(validatedData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to update room: ${error.message}`);
  }
  
  return validateData(schemas.roomSchema, data);
}

// Reservation operations
export async function createValidatedReservation(reservationData: unknown) {
  const validatedData = validateData(schemas.reservationCreateSchema, reservationData);
  
  const { data, error } = await supabase
    .from('reservations')
    .insert(validatedData)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to create reservation: ${error.message}`);
  }
  
  return validateData(schemas.reservationSchema, data);
}

export async function updateValidatedReservation(id: string, reservationData: unknown) {
  const validatedData = validateData(schemas.reservationUpdateSchema, reservationData);
  
  const { data, error } = await supabase
    .from('reservations')
    .update(validatedData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to update reservation: ${error.message}`);
  }
  
  return validateData(schemas.reservationSchema, data);
}

// Payment operations
export async function createValidatedPayment(paymentData: unknown) {
  const validatedData = validateData(schemas.paymentCreateSchema, paymentData);
  
  const { data, error } = await supabase
    .from('payments')
    .insert(validatedData)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to create payment: ${error.message}`);
  }
  
  return validateData(schemas.paymentSchema, data);
}

// Hotel settings operations
export async function updateValidatedHotelSettings(settingsData: unknown) {
  const validatedData = validateData(schemas.hotelSettingsCreateSchema, settingsData);
  
  const { data, error } = await supabase
    .from('hotel_settings')
    .upsert(validatedData)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to update hotel settings: ${error.message}`);
  }
  
  return validateData(schemas.hotelSettingsSchema, data);
}

// Audit log operations
export async function createValidatedAuditLog(auditData: unknown) {
  const validatedData = validateData(schemas.auditLogCreateSchema, auditData);
  
  const { data, error } = await supabase
    .from('audit_log')
    .insert(validatedData)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to create audit log: ${error.message}`);
  }
  
  return validateData(schemas.auditLogSchema, data);
} 