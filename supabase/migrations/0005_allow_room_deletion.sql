-- Migration: Allow deletion of rooms with completed reservations
-- This migration updates the foreign key constraint to allow room deletion
-- while preserving reservation history by setting room_id to NULL.

-- Step 1: Make room_id nullable to support SET NULL constraint
ALTER TABLE public.reservations 
ALTER COLUMN room_id DROP NOT NULL;

-- Step 2: Drop the existing RESTRICT constraint
ALTER TABLE public.reservations 
DROP CONSTRAINT reservations_room_id_fkey;

-- Step 3: Add new constraint with SET NULL on delete
ALTER TABLE public.reservations 
ADD CONSTRAINT reservations_room_id_fkey 
FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE SET NULL;

-- Step 4: Add comment explaining the change
COMMENT ON COLUMN public.reservations.room_id IS 'References rooms table. Can be NULL if room was deleted (preserves reservation history).';

-- Step 5: Create index for performance on nullable room_id lookups
CREATE INDEX IF NOT EXISTS idx_reservations_room_id_not_null 
ON public.reservations (room_id) 
WHERE room_id IS NOT NULL;