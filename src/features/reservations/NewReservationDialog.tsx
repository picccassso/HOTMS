import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { reservationCreateSchema, type ReservationCreate } from "@/types/schemas";
import { useRooms } from "@/features/rooms/useRooms";
import { GuestCombobox } from "@/features/guests/GuestCombobox";
import { GuestForm } from "@/features/guests/GuestForm";
import { useGuests } from "@/features/guests/useGuests";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface NewReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ReservationCreate) => Promise<void>;
  initialStartDate?: Date;
  initialEndDate?: Date;
}

export const NewReservationDialog = ({ 
  open, 
  onOpenChange, 
  onSubmit, 
  initialStartDate,
  initialEndDate 
}: NewReservationDialogProps) => {
  const { rooms, loading: roomsLoading } = useRooms();
  const { addGuest } = useGuests();
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReservationCreate>({
    resolver: zodResolver(reservationCreateSchema),
    defaultValues: {
      guest_id: "",
      room_id: "",
      start_date: initialStartDate ? format(initialStartDate, "yyyy-MM-dd") : "",
      end_date: initialEndDate ? format(initialEndDate, "yyyy-MM-dd") : "",
      status: "pending",
    },
  });

  const activeRooms = rooms.filter(room => room.is_active);

  const handleSubmit = async (data: ReservationCreate) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      // Error handling is done by the parent component
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateGuest = async (guestData: any) => {
    try {
      const newGuest = await addGuest(guestData);
      form.setValue("guest_id", newGuest.id);
      setShowGuestForm(false);
    } catch (error) {
      console.error('Error creating guest:', error);
      throw error;
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>New Reservation</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="guest_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Guest</FormLabel>
                    <FormControl>
                      <GuestCombobox
                        value={field.value}
                        onValueChange={field.onChange}
                        onCreateNew={() => setShowGuestForm(true)}
                        placeholder="Select or add guest..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="room_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select room" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roomsLoading ? (
                          <SelectItem value="loading" disabled>
                            Loading rooms...
                          </SelectItem>
                        ) : activeRooms.length === 0 ? (
                          <SelectItem value="no-rooms" disabled>
                            No active rooms available
                          </SelectItem>
                        ) : (
                          activeRooms.map((room) => (
                            <SelectItem key={room.id} value={room.id}>
                              Room {room.room_number} - {room.room_type} (${room.rate}/night)
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Check-in Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Check-out Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="checked_in">Checked In</SelectItem>
                        <SelectItem value="checked_out">Checked Out</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Reservation"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Guest Creation Form */}
      <GuestForm
        open={showGuestForm}
        onOpenChange={setShowGuestForm}
        onSubmit={handleCreateGuest}
        title="Add New Guest"
      />
    </>
  );
};