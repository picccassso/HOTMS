import { useState } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  type SortingState,
} from "@tanstack/react-table";
import { MoreHorizontal, Plus, Edit, Trash2 } from "lucide-react";
import { useGuests } from "@/features/guests/useGuests";
import { GuestForm } from "@/features/guests/GuestForm";
import { MergeGuestsDialog } from "@/features/guests/MergeGuestsDialog";
import type { Guest, GuestCreate } from "@/types/schemas";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";

export default function GuestsPage() {
  const { guests, loading, error, addGuest, editGuest, removeGuest } = useGuests();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [deletingGuest, setDeletingGuest] = useState<Guest | null>(null);
  const [guestWithReservations, setGuestWithReservations] = useState<Guest | null>(null);
  const [selectedGuests, setSelectedGuests] = useState<Set<string>>(new Set());
  const [showMergeDialog, setShowMergeDialog] = useState(false);

  const columns: ColumnDef<Guest>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => {
            row.toggleSelected(!!value);
            const newSelected = new Set(selectedGuests);
            if (value) {
              newSelected.add(row.original.id);
            } else {
              newSelected.delete(row.original.id);
            }
            setSelectedGuests(newSelected);
          }}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "full_name",
      header: "Name",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "phone_number",
      header: "Phone",
      cell: ({ row }) => {
        const phone = row.getValue("phone_number") as string;
        return phone || "—";
      },
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => {
        const address = row.getValue("address") as string;
        return address ? (
          <span className="truncate max-w-[200px] block" title={address}>
            {address}
          </span>
        ) : "—";
      },
    },
    {
      accessorKey: "created_at",
      header: "Added",
      cell: ({ row }) => {
        const date = new Date(row.getValue("created_at"));
        return date.toLocaleDateString();
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const guest = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditingGuest(guest)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setDeletingGuest(guest)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: guests,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    enableRowSelection: true,
  });

  const handleCreateGuest = async (data: GuestCreate) => {
    await addGuest(data);
  };

  const handleEditGuest = async (data: GuestCreate) => {
    if (editingGuest) {
      await editGuest(editingGuest.id, data);
      setEditingGuest(null);
    }
  };

  const handleDeleteGuest = async () => {
    if (deletingGuest) {
      try {
        await removeGuest(deletingGuest.id);
        setDeletingGuest(null);
      } catch (error) {
        if (error instanceof Error && error.message === 'GUEST_HAS_RESERVATIONS') {
          // Close delete dialog and show reservations warning
          setDeletingGuest(null);
          setGuestWithReservations(deletingGuest);
        } else {
          // Show generic error
          console.error('Failed to delete guest:', error);
          alert('Failed to delete guest. Please try again.');
        }
      }
    }
  };

  const selectedCount = selectedGuests.size;
  const canMerge = selectedCount === 2;
  const selectedGuestObjects = guests.filter(guest => selectedGuests.has(guest.id));

  const handleMergeComplete = () => {
    setSelectedGuests(new Set());
    setShowMergeDialog(false);
    // Trigger a refetch of guests data
    window.location.reload(); // Simple approach for now
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading guests...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2 pb-6 border-b border-border">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Guests</h1>
            <p className="text-muted-foreground text-lg">Manage your hotel guests</p>
          </div>
          <div className="flex space-x-2">
            {canMerge && (
              <Button variant="outline" onClick={() => setShowMergeDialog(true)} className="shadow-lg hover:shadow-xl transition-shadow duration-200">
                Merge Selected Guests
              </Button>
            )}
            <Button onClick={() => setShowCreateForm(true)} className="shadow-lg hover:shadow-xl transition-shadow duration-200">
              <Plus className="mr-2 h-4 w-4" />
              Add Guest
            </Button>
          </div>
        </div>
      </div>

      {selectedCount > 0 && (
        <div className="bg-card border border-border rounded-lg shadow-lg p-6 transition-all duration-300">
          <p className="text-sm text-foreground">
            {selectedCount} guest{selectedCount > 1 ? 's' : ''} selected
            {selectedCount === 2 && ' (ready to merge)'}
            {selectedCount > 2 && ' (select exactly 2 to merge)'}
          </p>
        </div>
      )}

      <div className="bg-card border border-border rounded-lg shadow-lg p-0 overflow-hidden transition-shadow duration-200 hover:shadow-xl">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No guests found. Add your first guest to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Guest Form */}
      <GuestForm
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        onSubmit={handleCreateGuest}
        title="Add New Guest"
      />

      {/* Edit Guest Form */}
      {editingGuest && (
        <GuestForm
          open={!!editingGuest}
          onOpenChange={(open) => !open && setEditingGuest(null)}
          onSubmit={handleEditGuest}
          initialData={editingGuest}
          title="Edit Guest"
        />
      )}

      {/* Merge Guests Dialog */}
      {canMerge && selectedGuestObjects.length === 2 && (
        <MergeGuestsDialog
          open={showMergeDialog}
          onOpenChange={setShowMergeDialog}
          guests={selectedGuestObjects as [Guest, Guest]}
          onMergeComplete={handleMergeComplete}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingGuest} onOpenChange={(open) => !open && setDeletingGuest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Guest</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {deletingGuest?.full_name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingGuest(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteGuest}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Guest Has Reservations Dialog */}
      <Dialog open={!!guestWithReservations} onOpenChange={(open) => !open && setGuestWithReservations(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cannot Delete Guest</DialogTitle>
            <DialogDescription>
              {guestWithReservations?.full_name} cannot be deleted because they have active reservations.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              To remove this guest, you can:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>Complete their current reservations (check them out), then delete the guest</li>
              <li>Cancel their pending/confirmed reservations, then delete the guest</li>
              <li>Use the "Merge Guests" feature to combine this guest with another guest</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-4">
              Note: Guests with only checked-out or cancelled reservations can be deleted.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGuestWithReservations(null)}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}