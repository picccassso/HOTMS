-- Phase 0: Initial Schema for HOTMS v4.0
-- This script creates all tables, constraints, and future-proofing elements.

-- Step 1: Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- Step 2: Create core tables

-- Owner Profile Table (linked to auth user)
CREATE TABLE public.owner_profile (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.owner_profile IS 'Stores profile information for the single owner, linked to their authentication account.';

-- Hotel Settings Table (single row)
CREATE TABLE public.hotel_settings (
    id INT PRIMARY KEY DEFAULT 1,
    name TEXT NOT NULL,
    timezone TEXT NOT NULL,
    current_app_version TEXT,
    last_successful_backup_at TIMESTAMPTZ,
    CONSTRAINT single_row_check CHECK (id = 1)
);
COMMENT ON TABLE public.hotel_settings IS 'A single-row table for global hotel settings and at-a-glance operational status.';

-- Guests Table
CREATE TABLE public.guests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone_number TEXT,
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT guests_email_unique UNIQUE (email)
);
COMMENT ON TABLE public.guests IS 'Stores information about guests, with a unique constraint on email to prevent duplicates.';

-- Rooms Table
CREATE TABLE public.rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_number TEXT NOT NULL,
    room_type TEXT NOT NULL,
    rate NUMERIC(10, 2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT rooms_room_number_unique UNIQUE (room_number)
);
COMMENT ON TABLE public.rooms IS 'Defines the hotel rooms available for booking.';

-- Reservations Table
CREATE TABLE public.reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guest_id UUID NOT NULL REFERENCES public.guests(id) ON DELETE RESTRICT,
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE RESTRICT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- e.g., pending, confirmed, checked_in, checked_out, cancelled
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT dates_check CHECK (end_date > start_date),
    -- This is the critical constraint to prevent double-booking the same room for overlapping dates.
    CONSTRAINT no_overlapping_reservations EXCLUDE USING gist (
        room_id WITH =,
        daterange(start_date, end_date, '[]') WITH &&
    )
);
COMMENT ON TABLE public.reservations IS 'Core table for managing bookings, with a GIST constraint to physically prevent overlapping stays for the same room.';

-- Payments Table
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reservation_id UUID NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    payment_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    payment_method TEXT, -- e.g., 'External Card', 'External Cash'
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.payments IS 'Logs all payments against a reservation.';

-- Audit Log Table
CREATE TABLE public.audit_log (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    action_type TEXT NOT NULL, -- e.g., 'CREATE_RESERVATION', 'MERGE_GUESTS'
    target_table TEXT NOT NULL,
    record_id UUID,
    change_description TEXT NOT NULL, -- A human-readable description of the change
    user_id UUID REFERENCES auth.users(id)
);
COMMENT ON TABLE public.audit_log IS 'Provides a detailed, human-readable log of all significant actions in the system.';

-- Step 3: Create empty archive tables for future use (Phase 5)
CREATE TABLE public.payments_archive (LIKE public.payments INCLUDING ALL);
CREATE TABLE public.audit_log_archive (LIKE public.audit_log INCLUDING ALL);

COMMENT ON TABLE public.payments_archive IS 'Long-term storage for historical payment records.';
COMMENT ON TABLE public.audit_log_archive IS 'Long-term storage for historical audit logs.'; 