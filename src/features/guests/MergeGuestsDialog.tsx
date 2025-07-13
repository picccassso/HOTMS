import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/services/supabase";
import type { Guest } from "@/types/schemas";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const mergeSchema = z.object({
  full_name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone_number: z.string().optional(),
  address: z.string().optional(),
});

type MergeFormData = z.infer<typeof mergeSchema>;

interface MergeGuestsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guests: [Guest, Guest];
  onMergeComplete: () => void;
}

export const MergeGuestsDialog = ({ 
  open, 
  onOpenChange, 
  guests, 
  onMergeComplete 
}: MergeGuestsDialogProps) => {
  const [guest1, guest2] = guests;
  const [targetGuestId, setTargetGuestId] = useState<string>(guest1.id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<MergeFormData>({
    resolver: zodResolver(mergeSchema),
    defaultValues: {
      full_name: guest1.full_name,
      email: guest1.email,
      phone_number: guest1.phone_number || "",
      address: guest1.address || "",
    },
  });

  const sourceGuest = targetGuestId === guest1.id ? guest2 : guest1;

  const handleFieldChange = (field: keyof MergeFormData, value: string) => {
    form.setValue(field, value);
  };

  const handleSubmit = async (data: MergeFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No authenticated session');
      }

      // Call the Edge Function
      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        'merge-guests',
        {
          body: {
            targetGuestId: targetGuestId,
            sourceGuestId: sourceGuest.id,
            mergedData: {
              full_name: data.full_name,
              email: data.email,
              phone_number: data.phone_number || null,
              address: data.address || null,
            },
          },
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (functionError) {
        throw new Error(functionError.message || 'Failed to merge guests');
      }

      if (!functionData?.success) {
        throw new Error(functionData?.error || 'Merge operation failed');
      }

      onMergeComplete();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Merge Guests</DialogTitle>
          <DialogDescription>
            Select which data to keep for each field. The guest on the left will be kept, and the guest on the right will be deleted.
            All reservations will be transferred to the kept guest.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Target Guest Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Which guest record should be kept?</Label>
              <RadioGroup
                value={targetGuestId}
                onValueChange={setTargetGuestId}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={guest1.id} id="guest1" />
                  <Label htmlFor="guest1">{guest1.full_name} ({guest1.email})</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={guest2.id} id="guest2" />
                  <Label htmlFor="guest2">{guest2.full_name} ({guest2.email})</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Field Comparisons */}
            <div className="space-y-4">
              {/* Full Name */}
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">
                          {guest1.full_name === guest2.full_name ? "Both guests" : `${guest1.full_name} (${guest1.email})`}
                        </Label>
                        <Button
                          type="button"
                          variant={field.value === guest1.full_name ? "default" : "outline"}
                          className="w-full justify-start"
                          onClick={() => handleFieldChange('full_name', guest1.full_name)}
                        >
                          {guest1.full_name}
                        </Button>
                      </div>
                      {guest1.full_name !== guest2.full_name && (
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">
                            {guest2.full_name} ({guest2.email})
                          </Label>
                          <Button
                            type="button"
                            variant={field.value === guest2.full_name ? "default" : "outline"}
                            className="w-full justify-start"
                            onClick={() => handleFieldChange('full_name', guest2.full_name)}
                          >
                            {guest2.full_name}
                          </Button>
                        </div>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">
                          {guest1.email === guest2.email ? "Both guests" : `${guest1.full_name}`}
                        </Label>
                        <Button
                          type="button"
                          variant={field.value === guest1.email ? "default" : "outline"}
                          className="w-full justify-start"
                          onClick={() => handleFieldChange('email', guest1.email)}
                        >
                          {guest1.email}
                        </Button>
                      </div>
                      {guest1.email !== guest2.email && (
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">
                            {guest2.full_name}
                          </Label>
                          <Button
                            type="button"
                            variant={field.value === guest2.email ? "default" : "outline"}
                            className="w-full justify-start"
                            onClick={() => handleFieldChange('email', guest2.email)}
                          >
                            {guest2.email}
                          </Button>
                        </div>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone Number */}
              <FormField
                control={form.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">{guest1.full_name}</Label>
                        <Button
                          type="button"
                          variant={field.value === (guest1.phone_number || "") ? "default" : "outline"}
                          className="w-full justify-start"
                          onClick={() => handleFieldChange('phone_number', guest1.phone_number || "")}
                        >
                          {guest1.phone_number || "No phone number"}
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">{guest2.full_name}</Label>
                        <Button
                          type="button"
                          variant={field.value === (guest2.phone_number || "") ? "default" : "outline"}
                          className="w-full justify-start"
                          onClick={() => handleFieldChange('phone_number', guest2.phone_number || "")}
                        >
                          {guest2.phone_number || "No phone number"}
                        </Button>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Address */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">{guest1.full_name}</Label>
                        <Button
                          type="button"
                          variant={field.value === (guest1.address || "") ? "default" : "outline"}
                          className="w-full justify-start text-left whitespace-normal h-auto p-3"
                          onClick={() => handleFieldChange('address', guest1.address || "")}
                        >
                          {guest1.address || "No address"}
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">{guest2.full_name}</Label>
                        <Button
                          type="button"
                          variant={field.value === (guest2.address || "") ? "default" : "outline"}
                          className="w-full justify-start text-left whitespace-normal h-auto p-3"
                          onClick={() => handleFieldChange('address', guest2.address || "")}
                        >
                          {guest2.address || "No address"}
                        </Button>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-red-600 hover:bg-red-700">
                {isSubmitting ? "Merging..." : `Merge Guests`}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};