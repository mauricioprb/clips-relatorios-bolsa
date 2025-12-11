import { CheckIcon, Filter, RefreshCcw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import { useCalendar } from "@/components/calendar/contexts/calendar-context";
import { BG_COLORS, PRIORITY_COLORS, PRIORITY_LABELS } from "@/components/calendar/constants";
import { cn } from "@/lib/utils";

export default function FilterEvents() {
  const { selectedColors, filterEventsBySelectedColors, clearFilter } = useCalendar();

  const filterOptions = [...PRIORITY_COLORS, "cinza" as const];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Toggle variant="outline" className="cursor-pointer w-fit">
          <Filter className="h-4 w-4" />
        </Toggle>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {filterOptions.map((color, index) => {
          const bgClass = BG_COLORS[color];
          const label = PRIORITY_LABELS[color] || (color === "cinza" ? "Grade Semanal" : color);

          return (
            <DropdownMenuItem
              key={index}
              className="flex items-center gap-2 cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                filterEventsBySelectedColors(color);
              }}
            >
              <div className={cn("size-3.5 rounded-full", bgClass)} />
              <span className="capitalize flex justify-center items-center gap-2">
                {label}
                <span>
                  {selectedColors.includes(color) && (
                    <span className="text-primary">
                      <CheckIcon className="size-4" />
                    </span>
                  )}
                </span>
              </span>
            </DropdownMenuItem>
          );
        })}
        <Separator className="my-2" />
        <DropdownMenuItem
          disabled={selectedColors.length === 0}
          className="flex gap-2 cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            clearFilter();
          }}
        >
          <RefreshCcw className="size-3.5" />
          Limpar filtro
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
