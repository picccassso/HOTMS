import { z } from 'zod';

// Base UUID schema
const uuidSchema = z.string().uuid('Invalid UUID format');

// Email validation schema
const emailSchema = z.string().email('Invalid email format').min(1, 'Email is required');

// Phone number validation (basic international format)
const phoneSchema = z.string()
  .regex(/^[\+]?[\d\s\-\(\)]{7,15}$/, 'Invalid phone number format')
  .optional();

// Monetary amount validation
const monetaryAmountSchema = z.number()
  .positive('Amount must be positive')
  .multipleOf(0.01, 'Amount must have at most 2 decimal places')
  .max(999999.99, 'Amount too large');

// Dates validation
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');
const timestampSchema = z.string().datetime('Invalid timestamp format');

// Owner Profile Schemas
export const ownerProfileCreateSchema = z.object({
  id: uuidSchema,
  full_name: z.string()
    .min(1, 'Full name is required')
    .max(100, 'Full name too long')
    .regex(/^[a-zA-Z\s\-\.\']+$/, 'Name can only contain letters, spaces, hyphens, periods, and apostrophes')
});

export const ownerProfileSchema = ownerProfileCreateSchema.extend({
  created_at: timestampSchema
});

// Hotel Settings Schemas
export const hotelSettingsCreateSchema = z.object({
  id: z.literal(1),
  name: z.string()
    .min(1, 'Hotel name is required')
    .max(100, 'Hotel name too long'),
  timezone: z.string()
    .min(1, 'Timezone is required')
    .regex(/^[A-Za-z_]+\/[A-Za-z_]+$/, 'Invalid timezone format (e.g., America/New_York)'),
  current_app_version: z.string().optional(),
  last_successful_backup_at: timestampSchema.optional()
});

export const hotelSettingsSchema = hotelSettingsCreateSchema;

// Guest Schemas
export const guestCreateSchema = z.object({
  full_name: z.string()
    .min(1, 'Guest name is required')
    .max(100, 'Guest name too long')
    .regex(/^[a-zA-Z\s\-\.\']+$/, 'Name can only contain letters, spaces, hyphens, periods, and apostrophes'),
  email: emailSchema,
  phone_number: phoneSchema,
  address: z.string()
    .max(500, 'Address too long')
    .optional()
});

export const guestSchema = guestCreateSchema.extend({
  id: uuidSchema,
  created_at: timestampSchema
});

export const guestUpdateSchema = guestCreateSchema.partial();

// Room Schemas
export const roomCreateSchema = z.object({
  room_number: z.string()
    .min(1, 'Room number is required')
    .max(20, 'Room number too long')
    .regex(/^[A-Za-z0-9\-]+$/, 'Room number can only contain letters, numbers, and hyphens'),
  room_type: z.string()
    .min(1, 'Room type is required')
    .max(50, 'Room type too long'),
  rate: monetaryAmountSchema,
  is_active: z.boolean().default(true)
});

export const roomSchema = roomCreateSchema.extend({
  id: uuidSchema,
  created_at: timestampSchema
});

export const roomUpdateSchema = roomCreateSchema.partial();

// Reservation Schemas
export const reservationCreateSchema = z.object({
  guest_id: uuidSchema,
  room_id: uuidSchema,
  start_date: dateSchema,
  end_date: dateSchema,
  status: z.enum(['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'])
    .default('pending')
}).refine(
  (data) => new Date(data.end_date) > new Date(data.start_date),
  {
    message: 'End date must be after start date',
    path: ['end_date']
  }
);

export const reservationSchema = reservationCreateSchema.extend({
  id: uuidSchema,
  created_at: timestampSchema
});

export const reservationUpdateSchema = reservationCreateSchema.partial();

// Payment Schemas
export const paymentCreateSchema = z.object({
  reservation_id: uuidSchema,
  amount: monetaryAmountSchema,
  payment_date: timestampSchema.optional(),
  payment_method: z.string()
    .max(50, 'Payment method description too long')
    .optional(),
  notes: z.string()
    .max(500, 'Notes too long')
    .optional()
});

export const paymentSchema = paymentCreateSchema.extend({
  id: uuidSchema,
  created_at: timestampSchema,
  payment_date: timestampSchema // Make required in full schema
});

// Audit Log Schemas
export const auditLogCreateSchema = z.object({
  action_type: z.string()
    .min(1, 'Action type is required')
    .max(50, 'Action type too long')
    .regex(/^[A-Z_]+$/, 'Action type must be uppercase with underscores'),
  target_table: z.string()
    .min(1, 'Target table is required')
    .max(50, 'Target table name too long'),
  record_id: uuidSchema.optional(),
  change_description: z.string()
    .min(1, 'Change description is required')
    .max(1000, 'Change description too long'),
  user_id: uuidSchema.optional()
});

export const auditLogSchema = auditLogCreateSchema.extend({
  id: z.number().int().positive(),
  timestamp: timestampSchema
});

// Export type definitions
export type OwnerProfileCreate = z.infer<typeof ownerProfileCreateSchema>;
export type OwnerProfile = z.infer<typeof ownerProfileSchema>;
export type HotelSettingsCreate = z.infer<typeof hotelSettingsCreateSchema>;
export type HotelSettings = z.infer<typeof hotelSettingsSchema>;
export type GuestCreate = z.infer<typeof guestCreateSchema>;
export type Guest = z.infer<typeof guestSchema>;
export type GuestUpdate = z.infer<typeof guestUpdateSchema>;
export type RoomCreate = z.infer<typeof roomCreateSchema>;
export type Room = z.infer<typeof roomSchema>;
export type RoomUpdate = z.infer<typeof roomUpdateSchema>;
export type ReservationCreate = z.infer<typeof reservationCreateSchema>;
export type Reservation = z.infer<typeof reservationSchema> & {
  guest?: Guest;
  room?: Room;
};
export type ReservationUpdate = z.infer<typeof reservationUpdateSchema>;
export type PaymentCreate = z.infer<typeof paymentCreateSchema>;
export type Payment = z.infer<typeof paymentSchema>;
export type AuditLogCreate = z.infer<typeof auditLogCreateSchema>;
export type AuditLog = z.infer<typeof auditLogSchema>; 