import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function DropdownMenuRadioEmployeeType({ position, setPosition }: { position: string; setPosition: (value: string) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="mt-1 block p-2 border border-gray-300 rounded-2xl shadow-sm focus:outline-none">
          {position || "Selecione o tipo de funcionário"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 rounded-2xl shadow-lg">
        <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
          <DropdownMenuRadioItem value="Interno">Interno</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="Externo">Externo</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="Administrador">Administrador</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
