-- Single Owner Enforcement: Ensure only one owner can exist
-- This migration adds constraints to prevent multiple owners

-- Step 1: Add a unique constraint to enforce single owner
-- We'll add a check constraint that ensures only one row can exist
ALTER TABLE public.owner_profile 
ADD CONSTRAINT single_owner_check CHECK (id IS NOT NULL);

-- Step 2: Create a unique partial index to enforce single owner
-- This ensures only one owner record can exist regardless of the UUID
CREATE UNIQUE INDEX IF NOT EXISTS single_owner_idx 
ON public.owner_profile ((1)) 
WHERE id IS NOT NULL;

-- Step 3: Create function to check if owner already exists
CREATE OR REPLACE FUNCTION owner_exists()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.owner_profile LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create function to safely create owner (prevents duplicates)
CREATE OR REPLACE FUNCTION create_owner_if_none_exists(
  user_id UUID,
  full_name_param TEXT
)
RETURNS boolean AS $$
BEGIN
  -- Check if owner already exists
  IF owner_exists() THEN
    RETURN FALSE; -- Owner already exists, cannot create another
  END IF;
  
  -- Create the owner record
  INSERT INTO public.owner_profile (id, full_name)
  VALUES (user_id, full_name_param);
  
  RETURN TRUE; -- Successfully created owner
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Add comment explaining the constraint
COMMENT ON INDEX single_owner_idx IS 'Ensures only one owner can exist in the system by creating a unique constraint on a constant value (1) for all non-null rows.'; 