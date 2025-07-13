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
import { useRooms } from "@/features/rooms/useRooms";
import { RoomForm } from "@/features/rooms/RoomForm";
import type { Room, RoomCreate } from "@/types/schemas";
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

export default function RoomsPage() {
  const { rooms, loading, error, addRoom, editRoom, removeRoom } = useRooms();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deletingRoom, setDeletingRoom] = useState<Room | null>(null);
  const [roomWithReservations, setRoomWithReservations] = useState<Room | null>(null);

  const columns: ColumnDef<Room>[] = [
    {
      accessorKey: "room_number",
      header: "Room Number",
    },
    {
      accessorKey: "room_type",
      header: "Type",
    },
    {
      accessorKey: "rate",
      header: "Rate",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("rate"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);
        return formatted;
      },
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("is_active") as boolean;
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            isActive 
              ? "bg-green-100 text-green-800" 
              : "bg-red-100 text-red-800"
          }`}>
            {isActive ? "Active" : "Inactive"}
          </span>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const room = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditingRoom(room)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setDeletingRoom(room)}
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
    data: rooms,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  const handleCreateRoom = async (data: RoomCreate) => {
    await addRoom(data);
  };

  const handleEditRoom = async (data: RoomCreate) => {
    if (editingRoom) {
      await editRoom(editingRoom.id, data);
      setEditingRoom(null);
    }
  };

  const handleDeleteRoom = async () => {
    if (deletingRoom) {
      try {
        await removeRoom(deletingRoom.id);
        setDeletingRoom(null);
      } catch (error) {
        if (error instanceof Error && error.message === 'ROOM_HAS_RESERVATIONS') {
          // Close delete dialog and show reservations warning
          setDeletingRoom(null);
          setRoomWithReservations(deletingRoom);
        } else {
          // Show generic error
          console.error('Failed to delete room:', error);
          alert('Failed to delete room. Please try again.');
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading rooms...</div>
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
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Rooms</h1>
            <p className="text-muted-foreground text-lg">Manage your hotel rooms and rates</p>
          </div>
          <Button onClick={() => setShowCreateForm(true)} className="shadow-lg hover:shadow-xl transition-shadow duration-200">
            <Plus className="mr-2 h-4 w-4" />
            Add Room
          </Button>
        </div>
      </div>

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
                  No rooms found. Add your first room to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Room Form */}
      <RoomForm
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        onSubmit={handleCreateRoom}
        title="Add New Room"
      />

      {/* Edit Room Form */}
      {editingRoom && (
        <RoomForm
          open={!!editingRoom}
          onOpenChange={(open) => !open && setEditingRoom(null)}
          onSubmit={handleEditRoom}
          initialData={editingRoom}
          title="Edit Room"
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingRoom} onOpenChange={(open) => !open && setDeletingRoom(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Room</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete room {deletingRoom?.room_number}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingRoom(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteRoom}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Room Has Reservations Dialog */}
      <Dialog open={!!roomWithReservations} onOpenChange={(open) => !open && setRoomWithReservations(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cannot Delete Room</DialogTitle>
            <DialogDescription>
              Room {roomWithReservations?.room_number} cannot be deleted because it has active reservations.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              To remove this room, you can:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>Complete current reservations (check guests out), then delete the room</li>
              <li>Cancel pending/confirmed reservations, then delete the room</li>
              <li>Mark the room as inactive instead of deleting it</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-4">
              Note: Rooms with only checked-out or cancelled reservations can be deleted.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoomWithReservations(null)}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}