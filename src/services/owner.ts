import { supabase } from './supabase';

export interface OwnerProfile {
  id: string;
  full_name: string;
  created_at: string;
}

/**
 * Check if an owner already exists in the system
 */
export async function checkOwnerExists(): Promise<boolean> {
  const { data, error } = await supabase.rpc('owner_exists');
  
  if (error) {
    console.error('Error checking owner existence:', error);
    throw new Error('Failed to check owner existence');
  }
  
  return data as boolean;
}

/**
 * Get the current owner profile (if exists)
 */
export async function getOwnerProfile(): Promise<OwnerProfile | null> {
  const { data, error } = await supabase
    .from('owner_profile')
    .select('*')
    .single();
  
  if (error) {
    // If no owner exists, return null (not an error)
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching owner profile:', error);
    throw new Error('Failed to fetch owner profile');
  }
  
  return data as OwnerProfile;
}

/**
 * Create owner profile if none exists
 * Returns true if successfully created, false if owner already exists
 */
export async function createOwnerIfNoneExists(
  userId: string, 
  fullName: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc('create_owner_if_none_exists', {
    user_id: userId,
    full_name_param: fullName
  });
  
  if (error) {
    console.error('Error creating owner:', error);
    throw new Error('Failed to create owner');
  }
  
  return data as boolean;
}

/**
 * Check if the current authenticated user is the owner
 */
export async function isCurrentUserOwner(): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_owner');
  
  if (error) {
    console.error('Error checking owner status:', error);
    return false;
  }
  
  return data as boolean;
} 