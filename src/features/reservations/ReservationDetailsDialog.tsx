import { useState } from "react";
import { format } from "date-fns";
import { Calendar, User, MapPin, CreditCard, Plus, AlertCircle, UserCheck, UserX } from "lucide-react";
import { usePayments } from "./usePayments";
import { AddPaymentDialog } from "./AddPaymentDialog";
import { updateReservation, checkInReservation, checkOutReservation } from "./api";
import type { Reservation, PaymentCreate } from "@/types/schemas";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ReservationDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservation: Reservation | null;
  onReservationUpdate?: () => void;
}

// Modern confirmation dialog component
interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  confirmVariant?: "default" | "destructive";
  isLoading?: boolean;
}

const ConfirmationDialog = ({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = "Confirm",
  confirmVariant = "default",
  isLoading = false
}: ConfirmationDialogProps) => {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground py-4">{description}</p>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant={confirmVariant}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const ReservationDetailsDialog = ({ 
  open, 
  onOpenChange, 
  reservation,
  onReservationUpdate 
}: ReservationDetailsDialogProps) => {
  const { payments, loading: paymentsLoading, addPayment, refetch: refetchPayments } = usePayments(reservation?.id);
  const [showAddPaymentDialog, setShowAddPaymentDialog] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showCheckInConfirm, setShowCheckInConfirm] = useState(false);
  const [showCheckOutConfirm, setShowCheckOutConfirm] = useState(false);

  if (!reservation) return null;

  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const isPaymentOutstanding = reservation.status === 'pending' || reservation.status === 'confirmed' && totalPaid === 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'confirmed':
        return 'bg-emerald-100 text-emerald-800';
      case 'checked_in':
        return 'bg-blue-100 text-blue-800';
      case 'checked_out':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddPayment = async (paymentData: PaymentCreate) => {
    try {
      await addPayment(paymentData);
      
      // If this is the first payment and reservation is pending, update to confirmed
      if (reservation.status === 'pending') {
        await updateReservation(reservation.id, { status: 'confirmed' });
        onReservationUpdate?.();
      }
      
      await refetchPayments();
    } catch (error) {
      console.error('Failed to add payment:', error);
      throw error;
    }
  };

  const handleCheckIn = async () => {
    try {
      setIsCheckingIn(true);
      await checkInReservation(reservation.id);
      onReservationUpdate?.();
    } catch (error) {
      console.error('Failed to check in:', error);
      alert('Failed to check in guest. Please try again.');
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setIsCheckingOut(true);
      await checkOutReservation(reservation.id);
      onReservationUpdate?.();
    } catch (error) {
      console.error('Failed to check out:', error);
      alert('Failed to check out guest. Please try again.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Reservation Details</span>
              <Badge className={getStatusColor(reservation.status)}>
                {reservation.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Payment Outstanding Alert */}
            {isPaymentOutstanding && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <div className="flex-1">
                  <p className="font-medium text-amber-800">Payment Outstanding</p>
                  <p className="text-sm text-amber-700">
                    This reservation requires payment confirmation to be marked as confirmed.
                  </p>
                </div>
              </div>
            )}

            {/* Guest Information */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold">Guest Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{reservation.guest?.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{reservation.guest?.email}</p>
                </div>
                {reservation.guest?.phone_number && (
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{reservation.guest.phone_number}</p>
                  </div>
                )}
                {reservation.guest?.address && (
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{reservation.guest.address}</p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Reservation Information */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold">Reservation Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                <div>
                  <p className="text-sm text-muted-foreground">Room</p>
                  <p className="font-medium">
                    Room {reservation.room?.room_number} - {reservation.room?.room_type}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rate</p>
                  <p className="font-medium">
                    ${reservation.room?.rate}/night
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Check-in</p>
                  <p className="font-medium">
                    {format(new Date(reservation.start_date), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Check-out</p>
                  <p className="font-medium">
                    {format(new Date(reservation.end_date), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Payment Information */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold">Payment Information</h3>
                </div>
                <Button
                  size="sm"
                  onClick={() => setShowAddPaymentDialog(true)}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Payment
                </Button>
              </div>

              <div className="ml-6 space-y-3">
                {paymentsLoading ? (
                  <p className="text-sm text-muted-foreground">Loading payments...</p>
                ) : payments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No payments recorded</p>
                ) : (
                  <div className="space-y-2">
                    {payments.map((payment) => (
                      <div key={payment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">${payment.amount.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">
                            {payment.payment_method && `${payment.payment_method} • `}
                            {format(new Date(payment.payment_date), 'MMM dd, yyyy')}
                          </p>
                          {payment.notes && (
                            <p className="text-sm text-muted-foreground">{payment.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="font-semibold">Total Paid:</span>
                      <span className="font-semibold text-emerald-600">
                        ${totalPaid.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Check-in / Check-out Actions */}
            {(reservation.status === 'confirmed' || reservation.status === 'checked_in') && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="font-semibold">Guest Actions</h3>
                  <div className="flex gap-3">
                    {reservation.status === 'confirmed' && (
                      <Button
                        onClick={() => setShowCheckInConfirm(true)}
                        disabled={isCheckingIn}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <UserCheck className="mr-2 h-4 w-4" />
                        {isCheckingIn ? 'Checking In...' : 'Check In'}
                      </Button>
                    )}
                    {reservation.status === 'checked_in' && (
                      <Button
                        onClick={() => setShowCheckOutConfirm(true)}
                        disabled={isCheckingOut}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        <UserX className="mr-2 h-4 w-4" />
                        {isCheckingOut ? 'Checking Out...' : 'Check Out'}
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Payment Dialog */}
      <AddPaymentDialog
        open={showAddPaymentDialog}
        onOpenChange={setShowAddPaymentDialog}
        onSubmit={handleAddPayment}
        reservationId={reservation.id}
      />

      {/* Check-in Confirmation Dialog */}
      <ConfirmationDialog
        open={showCheckInConfirm}
        onOpenChange={setShowCheckInConfirm}
        title="Check In Guest"
        description={`Are you sure you want to check in ${reservation.guest?.full_name}?`}
        onConfirm={handleCheckIn}
        confirmText="Check In"
        confirmVariant="default"
        isLoading={isCheckingIn}
      />

      {/* Check-out Confirmation Dialog */}
      <ConfirmationDialog
        open={showCheckOutConfirm}
        onOpenChange={setShowCheckOutConfirm}
        title="Check Out Guest"
        description={`Are you sure you want to check out ${reservation.guest?.full_name}?`}
        onConfirm={handleCheckOut}
        confirmText="Check Out"
        confirmVariant="default"
        isLoading={isCheckingOut}
      />
    </>
  );
};