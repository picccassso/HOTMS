import { useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGuests } from "./useGuests";
import type { Guest } from "@/types/schemas";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface GuestComboboxProps {
  value?: string;
  onValueChange: (value: string) => void;
  onCreateNew?: () => void;
  placeholder?: string;
}

export const GuestCombobox = ({ 
  value, 
  onValueChange, 
  onCreateNew,
  placeholder = "Select guest..." 
}: GuestComboboxProps) => {
  const [open, setOpen] = useState(false);
  const { guests, loading } = useGuests();

  const selectedGuest = guests.find((guest) => guest.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedGuest ? (
            <span className="truncate">
              {selectedGuest.full_name} ({selectedGuest.email})
            </span>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search guests..." />
          <CommandList>
            <CommandEmpty>
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-2">
                  No guests found.
                </p>
                {onCreateNew && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onCreateNew();
                      setOpen(false);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Guest
                  </Button>
                )}
              </div>
            </CommandEmpty>
            <CommandGroup>
              {loading ? (
                <CommandItem disabled>Loading guests...</CommandItem>
              ) : (
                guests.map((guest) => (
                  <CommandItem
                    key={guest.id}
                    value={`${guest.full_name} ${guest.email}`}
                    onSelect={() => {
                      onValueChange(guest.id === value ? "" : guest.id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === guest.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{guest.full_name}</span>
                      <span className="text-sm text-muted-foreground">
                        {guest.email}
                      </span>
                    </div>
                  </CommandItem>
                ))
              )}
            </CommandGroup>
            {onCreateNew && guests.length > 0 && (
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    onCreateNew();
                    setOpen(false);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Guest
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};