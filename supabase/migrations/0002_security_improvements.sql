-- Security Improvements: Owner-Only Access Control
-- This migration fixes the over-broad RLS policies to ensure only the owner can access data

-- Step 1: Create owner verification function
CREATE OR REPLACE FUNCTION is_owner()
RETURNS boolean AS $$
BEGIN
  -- Check if the current authenticated user exists in owner_profile table
  RETURN EXISTS (
    SELECT 1 FROM public.owner_profile 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Drop existing overly broad policies
DROP POLICY IF EXISTS "Allow full access to authenticated users" ON public.owner_profile;
DROP POLICY IF EXISTS "Allow full access to authenticated users" ON public.hotel_settings;
DROP POLICY IF EXISTS "Allow full access to authenticated users" ON public.guests;
DROP POLICY IF EXISTS "Allow full access to authenticated users" ON public.rooms;
DROP POLICY IF EXISTS "Allow full access to authenticated users" ON public.reservations;
DROP POLICY IF EXISTS "Allow full access to authenticated users" ON public.payments;
DROP POLICY IF EXISTS "Allow full access to authenticated users" ON public.audit_log;

-- Step 3: Create new owner-only policies
CREATE POLICY "Owner only access" ON public.owner_profile
    FOR ALL USING (is_owner()) WITH CHECK (is_owner());

CREATE POLICY "Owner only access" ON public.hotel_settings
    FOR ALL USING (is_owner()) WITH CHECK (is_owner());

CREATE POLICY "Owner only access" ON public.guests
    FOR ALL USING (is_owner()) WITH CHECK (is_owner());

CREATE POLICY "Owner only access" ON public.rooms
    FOR ALL USING (is_owner()) WITH CHECK (is_owner());

CREATE POLICY "Owner only access" ON public.reservations
    FOR ALL USING (is_owner()) WITH CHECK (is_owner());

CREATE POLICY "Owner only access" ON public.payments
    FOR ALL USING (is_owner()) WITH CHECK (is_owner());

CREATE POLICY "Owner only access" ON public.audit_log
    FOR ALL USING (is_owner()) WITH CHECK (is_owner());

-- Step 4: Keep the old authentication function for backward compatibility
-- (is_authenticated function remains available but is no longer used in policies) 