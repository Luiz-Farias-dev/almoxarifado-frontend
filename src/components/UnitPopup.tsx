import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type Status = {
  value: string
  label: string
}

const statuses: Status[] = [
  {
    value: "",
    label: "Nenhuma",
    },
  {
    value: "Un",
    label: "Un",
  },
  {
    value: "Kg",
    label: "Kg",
  },
  {
    value: "L",
    label: "L",
  },
  {
    value: "m",
    label: "m",
  },
  {
    value: "m²",
    label: "m²",
  },
  {
    value: "m³",
    label: "m³",
  },
]

export function ComboboxPopover({ onSelect }: { onSelect: (value: string) => void }) {
  const [open, setOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<Status | null>(
    null
  )

  const handleSelect = (value: string) => {
    const status = statuses.find((status) => status.value === value) || null;
    setSelectedStatus(status);
    setOpen(false);
    onSelect(value);
  };

  return (
    <div className="flex items-center space-x-4 mt-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="w-[150px] justify-start py-4 rounded-2xl border"
          >
            {selectedStatus ? (
              <div className="text-black font-normal">
                {selectedStatus.label}
              </div>
            ) : (
              <div className="text-gray-500 font-normal">Escolha a unidade</div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-1 rounded-2xl border" side="right" align="start">
          <Command>
            <CommandInput placeholder="Escolha a unidade" />
            <CommandList>
              <CommandEmpty>Nenhum resultado</CommandEmpty>
              <CommandGroup>
                {statuses.map((status) => (
                  <CommandItem
                    key={status.value}
                    value={status.value}
                    onSelect={handleSelect}
                  >
                    <span>{status.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
