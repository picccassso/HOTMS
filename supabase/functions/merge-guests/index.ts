import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface MergeGuestsRequest {
  targetGuestId: string;
  sourceGuestId: string;
  mergedData: {
    full_name: string;
    email: string;
    phone_number?: string;
    address?: string;
  };
}

Deno.serve(async (req) => {
  try {
    // Verify the request method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header missing' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse the request body
    const body: MergeGuestsRequest = await req.json();
    const { targetGuestId, sourceGuestId, mergedData } = body;

    // Validate required fields
    if (!targetGuestId || !sourceGuestId || !mergedData) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (targetGuestId === sourceGuestId) {
      return new Response(
        JSON.stringify({ error: 'Cannot merge guest with itself' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Set the user context from the authorization header
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !userData.user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Start the merge transaction
    const { data: sourceGuest, error: sourceError } = await supabase
      .from('guests')
      .select('*')
      .eq('id', sourceGuestId)
      .single();

    if (sourceError || !sourceGuest) {
      return new Response(
        JSON.stringify({ error: 'Source guest not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { data: targetGuest, error: targetError } = await supabase
      .from('guests')
      .select('*')
      .eq('id', targetGuestId)
      .single();

    if (targetError || !targetGuest) {
      return new Response(
        JSON.stringify({ error: 'Target guest not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 1. Reassign all reservations from sourceGuest to targetGuest
    const { error: reassignError } = await supabase
      .from('reservations')
      .update({ guest_id: targetGuestId })
      .eq('guest_id', sourceGuestId);

    if (reassignError) {
      return new Response(
        JSON.stringify({ error: 'Failed to reassign reservations', details: reassignError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Update the target guest with merged data
    const { error: updateError } = await supabase
      .from('guests')
      .update({
        full_name: mergedData.full_name,
        email: mergedData.email,
        phone_number: mergedData.phone_number || null,
        address: mergedData.address || null,
      })
      .eq('id', targetGuestId);

    if (updateError) {
      return new Response(
        JSON.stringify({ error: 'Failed to update target guest', details: updateError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Create audit log entry
    const auditDescription = `Merged guest "${sourceGuest.full_name}" (${sourceGuest.email}) into "${mergedData.full_name}" (${mergedData.email}). All reservations reassigned.`;
    
    const { error: auditError } = await supabase
      .from('audit_log')
      .insert({
        action_type: 'GUEST_MERGE',
        target_table: 'guests',
        record_id: targetGuestId,
        change_description: auditDescription,
        user_id: userData.user.id,
      });

    if (auditError) {
      console.error('Failed to create audit log:', auditError);
      // Don't fail the entire operation for audit log issues
    }

    // 4. Delete the source guest
    const { error: deleteError } = await supabase
      .from('guests')
      .delete()
      .eq('id', sourceGuestId);

    if (deleteError) {
      return new Response(
        JSON.stringify({ error: 'Failed to delete source guest', details: deleteError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Guests merged successfully',
        targetGuestId: targetGuestId,
        mergedData: mergedData,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Merge guests error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});