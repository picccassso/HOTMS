// src/pages/SetupWizard.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/services/supabase';
import { createOwnerIfNoneExists } from '@/services/owner';
import { Hotel, Building2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Form schemas
const hotelSchema = z.object({
  name: z.string().min(2, 'Hotel name must be at least 2 characters'),
  timezone: z.string().min(1, 'Please select a timezone'),
});

const roomSchema = z.object({
  room_number: z.string().min(1, 'Room number is required'),
  room_type: z.string().min(1, 'Room type is required'),
  rate: z.number().min(0, 'Rate must be positive'),
});

const roomsSchema = z.object({
  rooms: z.array(roomSchema).min(1, 'At least one room is required'),
});

type HotelFormData = z.infer<typeof hotelSchema>;
type RoomsFormData = z.infer<typeof roomsSchema>;

export default function SetupWizard() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{ id: string; email: string } | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [ownerProfileCreated, setOwnerProfileCreated] = useState(false);
  const navigate = useNavigate();

  // Form instances
  const hotelForm = useForm<HotelFormData>({
    resolver: zodResolver(hotelSchema),
    defaultValues: {
      name: '',
      timezone: 'UTC',
    },
  });

  const roomsForm = useForm<RoomsFormData>({
    resolver: zodResolver(roomsSchema),
    defaultValues: {
      rooms: [{ room_number: '', room_type: '', rate: 100 }],
    },
  });

  // Check for authenticated user and setup initial step
  useEffect(() => {
    const checkUserAndSetupStep = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          setError('Please log in first. An owner account should be created manually in Supabase dashboard.');
          return;
        }

        setUserProfile({
          id: session.user.id,
          email: session.user.email || '',
        });

        // For authenticated users, start at Step 2 (hotel information)
        // First check if owner profile exists, if not create it
        const ownerCreated = await createOwnerIfNoneExists(
          session.user.id, 
          session.user.email?.split('@')[0] || 'Owner'
        );
        
        // Track whether we created the profile or it already existed
        setOwnerProfileCreated(ownerCreated);
        
        // CRITICAL: Verify the user is actually in the owner_profile table
        // This ensures the RLS policy will allow access to hotel_settings
        const { data: verifyData, error: verifyError } = await supabase
          .from('owner_profile')
          .select('id')
          .eq('id', session.user.id)
          .maybeSingle(); // Use maybeSingle() instead of single() to handle 0 or 1 rows
        
        if (verifyError) {
          throw new Error(
            `Database error during owner profile verification: ${verifyError.message}\n\n` +
            `Error Code: ${verifyError.code}\n` +
            `This might be an RLS policy issue or database connectivity problem.`
          );
        }
        
        if (!verifyData) {
          throw new Error(
            `Owner profile was not created successfully. The create_owner_if_none_exists function ran but no profile exists.\n\n` +
            `This suggests either:\n` +
            `1. The function failed silently\n` +
            `2. There's an RLS policy preventing access\n` +
            `3. Multiple owners already exist (violating single-owner constraint)\n\n` +
            `Please check your Supabase logs for more details.`
          );
        }
        
        console.log('✅ User verified in owner_profile table:', verifyData);
        
        // Whether created or already existed, proceed to Step 2
        // The fact that we're in the setup wizard means some setup is incomplete
        setStep(2);
      } catch (err) {
        console.error('Setup initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize setup');
      } finally {
        setInitializing(false);
      }
    };
    
    checkUserAndSetupStep();
  }, []);



  const handleSaveHotelSettings = async (data: HotelFormData) => {
    setLoading(true);
    setError(null);

    try {
      // Verify we still have an active session
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('Session expired. Please refresh the page and try again.');
      }

      console.log('🔧 Attempting to save hotel settings...');
      console.log('🔧 User ID:', sessionData.session.user.id);
      console.log('🔧 Hotel data:', data);

      // Double-check that user is in owner_profile table before proceeding
      const { data: ownerCheck, error: ownerCheckError } = await supabase
        .from('owner_profile')
        .select('id')
        .eq('id', sessionData.session.user.id)
        .maybeSingle(); // Use maybeSingle() to handle 0 or 1 rows gracefully

      if (ownerCheckError) {
        throw new Error(
          `Database error checking owner profile: ${ownerCheckError.message}\n\n` +
          `Error Code: ${ownerCheckError.code}\n` +
          `This might be an RLS policy issue preventing access to owner_profile table.`
        );
      }

      if (!ownerCheck) {
        throw new Error(
          `User not found in owner_profile table.\n\n` +
          `This means the owner creation failed. Please refresh the page and try again.`
        );
      }

      console.log('✅ User verified in owner_profile before hotel_settings save');

      // Insert hotel settings
      const { error } = await supabase
        .from('hotel_settings')
        .insert({
          id: 1,
          name: data.name,
          timezone: data.timezone,
          current_app_version: '1.0.0',
          last_successful_backup_at: new Date().toISOString(),
        });

      if (error) {
        console.error('❌ Hotel settings save error:', error);
        throw new Error(
          `Failed to save hotel settings: ${error.message}\n\n` +
          `Error Code: ${error.code}\n` +
          `Error Details: ${error.details || 'No additional details'}\n\n` +
          `This is likely a database permission issue. Please check that the RLS policies are correctly configured.`
        );
      }

      console.log('✅ Hotel settings saved successfully');
      setStep(3);
    } catch (err) {
      console.error('❌ Hotel settings error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save hotel settings');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRooms = async (data: RoomsFormData) => {
    setLoading(true);
    setError(null);

    try {
      // Verify we still have an active session
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('Session expired. Please refresh the page and try again.');
      }

      // Insert rooms
      const { error } = await supabase
        .from('rooms')
        .insert(data.rooms);

      if (error) throw error;

      // Setup complete, navigate to main app
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create rooms');
    } finally {
      setLoading(false);
    }
  };

  const addRoom = () => {
    const currentRooms = roomsForm.getValues().rooms;
    roomsForm.setValue('rooms', [...currentRooms, { room_number: '', room_type: '', rate: 100 }]);
  };

  const removeRoom = (index: number) => {
    const currentRooms = roomsForm.getValues().rooms;
    if (currentRooms.length > 1) {
      roomsForm.setValue('rooms', currentRooms.filter((_, i) => i !== index));
    }
  };

  const timezones = [
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'Eastern Time' },
    { value: 'America/Chicago', label: 'Central Time' },
    { value: 'America/Denver', label: 'Mountain Time' },
    { value: 'America/Los_Angeles', label: 'Pacific Time' },
    { value: 'Europe/London', label: 'GMT' },
    { value: 'Europe/Paris', label: 'Central European Time' },
    { value: 'Asia/Tokyo', label: 'Japan Standard Time' },
    { value: 'Australia/Sydney', label: 'Australian Eastern Time' },
  ];

  // Show loading during initialization
  if (initializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 shadow-lg">
                <Hotel className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Initializing Setup</h1>
              <p className="text-slate-600 mb-6">Preparing your hotel management system...</p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 shadow-lg">
              <Hotel className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Setup Your Hotel</h1>
            <p className="text-slate-600">Complete your hotel management system setup</p>
            {userProfile && (
              <p className="text-sm text-slate-500 mt-2">Logged in as: {userProfile.email}</p>
            )}
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              {/* Step 1: Owner Profile (Auto-completed) */}
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div className={`h-1 w-12 ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`} />
              {/* Step 2: Hotel Information */}
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {step > 2 ? <CheckCircle className="h-5 w-5" /> : '2'}
              </div>
              <div className={`h-1 w-12 ${step >= 3 ? 'bg-primary' : 'bg-gray-200'}`} />
              {/* Step 3: Room Setup */}
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 3 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {step > 3 ? <CheckCircle className="h-5 w-5" /> : '3'}
              </div>
            </div>
          </div>

          {/* Step Labels */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4 text-xs">
              <div className="text-center w-8">
                <p className="text-primary font-medium">Owner</p>
              </div>
              <div className="w-12"></div>
              <div className="text-center w-8">
                <p className={step >= 2 ? 'text-primary font-medium' : 'text-gray-500'}>Hotel</p>
              </div>
              <div className="w-12"></div>
              <div className="text-center w-8">
                <p className={step >= 3 ? 'text-primary font-medium' : 'text-gray-500'}>Rooms</p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}



          {/* Step 2: Hotel Settings */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <Hotel className="h-12 w-12 text-primary mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2 text-slate-900">Hotel Information</h2>
                <p className="text-slate-600">Enter your hotel details</p>
                <div className="mt-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span>
                      {ownerProfileCreated 
                        ? 'Owner profile created successfully' 
                        : 'Owner profile verified'}
                    </span>
                  </div>
                </div>
              </div>

              <Form {...hotelForm}>
                <form onSubmit={hotelForm.handleSubmit(handleSaveHotelSettings)} className="space-y-4">
                  <FormField
                    control={hotelForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-900 font-medium">Hotel Name</FormLabel>
                        <FormControl>
                          <Input className="text-slate-900 placeholder-slate-500" placeholder="The Grand Hotel" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={hotelForm.control}
                    name="timezone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-900 font-medium">Timezone</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="text-slate-900">
                              <SelectValue placeholder="Select timezone" className="text-slate-900 placeholder-slate-500" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white border border-slate-200 text-slate-900">
                            {timezones.map((tz) => (
                              <SelectItem key={tz.value} value={tz.value} className="text-slate-900 hover:bg-slate-100 hover:text-slate-900 focus:bg-slate-100 focus:text-slate-900">
                                {tz.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={loading} className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-primary hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]">
                    {loading ? 'Saving...' : 'Continue'}
                  </Button>
                </form>
              </Form>
            </div>
          )}

          {/* Step 3: Initial Rooms */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <Building2 className="h-12 w-12 text-primary mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2 text-slate-900">Add Your Rooms</h2>
                <p className="text-slate-600">Create your initial room inventory</p>
              </div>

              <Form {...roomsForm}>
                <form onSubmit={roomsForm.handleSubmit(handleAddRooms)} className="space-y-4">
                  {roomsForm.watch('rooms').map((_, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">Room {index + 1}</h3>
                        {roomsForm.watch('rooms').length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeRoom(index)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={roomsForm.control}
                          name={`rooms.${index}.room_number`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-900 font-medium">Room Number</FormLabel>
                              <FormControl>
                                <Input className="text-slate-900 placeholder-slate-500" placeholder="101" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={roomsForm.control}
                          name={`rooms.${index}.room_type`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-900 font-medium">Room Type</FormLabel>
                              <FormControl>
                                <Input className="text-slate-900 placeholder-slate-500" placeholder="Standard" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={roomsForm.control}
                          name={`rooms.${index}.rate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-900 font-medium">Rate ($)</FormLabel>
                              <FormControl>
                                <Input 
                                  className="text-slate-900 placeholder-slate-500"
                                  type="number" 
                                  step="0.01"
                                  placeholder="100.00"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}

                  <Button type="button" variant="outline" onClick={addRoom} className="w-full">
                    Add Another Room
                  </Button>

                  <Button type="submit" disabled={loading} className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-primary hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]">
                    {loading ? 'Creating Rooms...' : 'Complete Setup'}
                  </Button>
                </form>
              </Form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}