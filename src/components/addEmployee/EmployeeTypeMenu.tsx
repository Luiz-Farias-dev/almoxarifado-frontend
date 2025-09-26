import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export function DropdownMenuRadioEmployeeType({ position, setPosition }: { position: string, setPosition: (value: string) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          {position || "Selecione o tipo"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Tipo de Funcionário</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
          <DropdownMenuRadioItem value="Interno">Interno</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="Externo">Externo</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="Almoxarife">Almoxarife</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="Administrador">Administrador</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}