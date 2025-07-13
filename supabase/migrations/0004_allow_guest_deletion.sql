-- Migration: Allow deletion of guests with completed reservations
-- This migration updates the foreign key constraint to allow guest deletion
-- while preserving reservation history by setting guest_id to NULL.

-- Step 1: Make guest_id nullable to support SET NULL constraint
ALTER TABLE public.reservations 
ALTER COLUMN guest_id DROP NOT NULL;

-- Step 2: Drop the existing RESTRICT constraint
ALTER TABLE public.reservations 
DROP CONSTRAINT reservations_guest_id_fkey;

-- Step 3: Add new constraint with SET NULL on delete
ALTER TABLE public.reservations 
ADD CONSTRAINT reservations_guest_id_fkey 
FOREIGN KEY (guest_id) REFERENCES public.guests(id) ON DELETE SET NULL;

-- Step 4: Add comment explaining the change
COMMENT ON COLUMN public.reservations.guest_id IS 'References guests table. Can be NULL if guest was deleted (preserves reservation history).';

-- Step 5: Create index for performance on nullable guest_id lookups
CREATE INDEX IF NOT EXISTS idx_reservations_guest_id_not_null 
ON public.reservations (guest_id) 
WHERE guest_id IS NOT NULL;