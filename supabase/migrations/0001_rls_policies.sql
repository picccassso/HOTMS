-- Phase 0: Row-Level Security (RLS) Policies
-- This script enables RLS and creates a default-deny policy,
-- allowing full access only to authenticated users.

-- Generic function to check for authenticated role
CREATE OR REPLACE FUNCTION is_authenticated()
RETURNS boolean AS $$
BEGIN
  RETURN auth.role() = 'authenticated';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE public.owner_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotel_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Create policies for each table
CREATE POLICY "Allow full access to authenticated users" ON public.owner_profile
    FOR ALL USING (is_authenticated()) WITH CHECK (is_authenticated());

CREATE POLICY "Allow full access to authenticated users" ON public.hotel_settings
    FOR ALL USING (is_authenticated()) WITH CHECK (is_authenticated());

CREATE POLICY "Allow full access to authenticated users" ON public.guests
    FOR ALL USING (is_authenticated()) WITH CHECK (is_authenticated());

CREATE POLICY "Allow full access to authenticated users" ON public.rooms
    FOR ALL USING (is_authenticated()) WITH CHECK (is_authenticated());

CREATE POLICY "Allow full access to authenticated users" ON public.reservations
    FOR ALL USING (is_authenticated()) WITH CHECK (is_authenticated());

CREATE POLICY "Allow full access to authenticated users" ON public.payments
    FOR ALL USING (is_authenticated()) WITH CHECK (is_authenticated());

CREATE POLICY "Allow full access to authenticated users" ON public.audit_log
    FOR ALL USING (is_authenticated()) WITH CHECK (is_authenticated()); 