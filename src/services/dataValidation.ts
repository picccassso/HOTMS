// Data Flow Validation: Ensures all data entering/leaving the system is validated
// This file provides wrappers and hooks for consistent validation across the app

import { z } from 'zod';
import { validateData, validateDataSafe, ValidationError } from './validation';
import * as schemas from '../types/schemas';

// Validation helpers for common data flows

/**
 * Validate data from external sources (user forms, API calls, etc.)
 * Throws ValidationError if invalid
 */
export const validateInput = {
  guest: (data: unknown) => validateData(schemas.guestCreateSchema, data),
  guestUpdate: (data: unknown) => validateData(schemas.guestUpdateSchema, data),
  room: (data: unknown) => validateData(schemas.roomCreateSchema, data),
  roomUpdate: (data: unknown) => validateData(schemas.roomUpdateSchema, data),
  reservation: (data: unknown) => validateData(schemas.reservationCreateSchema, data),
  reservationUpdate: (data: unknown) => validateData(schemas.reservationUpdateSchema, data),
  payment: (data: unknown) => validateData(schemas.paymentCreateSchema, data),
  hotelSettings: (data: unknown) => validateData(schemas.hotelSettingsCreateSchema, data),
  owner: (data: unknown) => validateData(schemas.ownerProfileCreateSchema, data),
  auditLog: (data: unknown) => validateData(schemas.auditLogCreateSchema, data),
};

/**
 * Safe validation for user interfaces (returns errors instead of throwing)
 * Returns { success: boolean, data?: T, errors?: string[] }
 */
export const validateInputSafe = {
  guest: (data: unknown) => validateDataSafe(schemas.guestCreateSchema, data),
  guestUpdate: (data: unknown) => validateDataSafe(schemas.guestUpdateSchema, data),
  room: (data: unknown) => validateDataSafe(schemas.roomCreateSchema, data),
  roomUpdate: (data: unknown) => validateDataSafe(schemas.roomUpdateSchema, data),
  reservation: (data: unknown) => validateDataSafe(schemas.reservationCreateSchema, data),
  reservationUpdate: (data: unknown) => validateDataSafe(schemas.reservationUpdateSchema, data),
  payment: (data: unknown) => validateDataSafe(schemas.paymentCreateSchema, data),
  hotelSettings: (data: unknown) => validateDataSafe(schemas.hotelSettingsCreateSchema, data),
  owner: (data: unknown) => validateDataSafe(schemas.ownerProfileCreateSchema, data),
  auditLog: (data: unknown) => validateDataSafe(schemas.auditLogCreateSchema, data),
};

/**
 * Validate data coming from the database (ensures data integrity)
 */
export const validateOutput = {
  guest: (data: unknown) => validateData(schemas.guestSchema, data),
  room: (data: unknown) => validateData(schemas.roomSchema, data),
  reservation: (data: unknown) => validateData(schemas.reservationSchema, data),
  payment: (data: unknown) => validateData(schemas.paymentSchema, data),
  hotelSettings: (data: unknown) => validateData(schemas.hotelSettingsSchema, data),
  owner: (data: unknown) => validateData(schemas.ownerProfileSchema, data),
  auditLog: (data: unknown) => validateData(schemas.auditLogSchema, data),
};

/**
 * Generic form validation wrapper
 * Useful for React forms and user interfaces
 */
export function createFormValidator<T>(schema: z.ZodSchema) {
  return (data: unknown) => {
    const result = validateDataSafe(schema, data);
    
    if (result.success) {
      return { isValid: true, data: result.data as T, errors: [] };
    } else {
      return { isValid: false, data: null, errors: result.errors || [] };
    }
  };
}

/**
 * Middleware function for API endpoints (when we build them)
 * Validates request data before processing
 */
export function validateRequestData<T>(schema: z.ZodSchema) {
  return (data: unknown): T => {
    try {
      return validateData(schema, data);
    } catch (error) {
      if (error instanceof ValidationError) {
        // Log validation errors for security monitoring
        console.warn('Validation failed for request data:', error.issues);
        throw error;
      }
      throw new Error('Invalid request data format');
    }
  };
}

/**
 * Security validation: Ensures no malicious data patterns
 * Basic XSS and injection prevention
 */
export function sanitizeStringInput(input: string): string {
  // Remove potential XSS patterns
  const sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
  
  return sanitized;
}

/**
 * Validate and sanitize text inputs
 */
export function validateAndSanitizeText(input: unknown): string {
  if (typeof input !== 'string') {
    throw new ValidationError(new Error('Input must be a string'));
  }
  
  const sanitized = sanitizeStringInput(input);
  
  // Check for potential SQL injection patterns
  const suspiciousPatterns = [
    /(\bunion\b|\bselect\b|\binsert\b|\bupdate\b|\bdelete\b|\bdrop\b)/gi,
    /['";].*[--]/gi, // SQL comment patterns
    /\b(or|and)\s+\d+\s*=\s*\d+/gi // Basic injection patterns
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(sanitized)) {
      console.warn('Potentially malicious input detected:', sanitized);
      throw new ValidationError(new Error('Input contains suspicious patterns'));
    }
  }
  
  return sanitized;
}

/**
 * Export validation error for consistent error handling
 */
export { ValidationError }; 