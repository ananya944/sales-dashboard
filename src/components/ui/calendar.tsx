import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-2", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-2 sm:space-x-3 sm:space-y-0 justify-between w-full",
        month: "space-y-2 w-[180px]",
        caption: "flex justify-center pt-0.5 relative items-center mb-1.5 h-7",
        caption_label: "text-xs font-semibold",
        nav: "flex items-center gap-0.5",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-6 w-6 rounded-md bg-slate-100 p-1 border-slate-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors"
        ),
        nav_button_previous: "",
        nav_button_next: "",
        table: "w-full border-collapse",
        head_row: "flex justify-between mb-0.5",
        head_cell:
          "text-slate-500 rounded-md w-6 font-medium text-[9px] text-center",
        row: "flex w-full mt-0.5 justify-between",
        cell: "h-6 w-6 text-center text-xs p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-blue-50 [&:has([aria-selected])]:bg-blue-50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-6 w-6 p-0 font-normal text-[11px] aria-selected:opacity-100 hover:bg-blue-700 hover:text-white transition-colors rounded-full"
        ),
        day_range_end: "day-range-end rounded-full",
        day_selected:
          "bg-blue-600 text-white hover:bg-blue-700 hover:text-white focus:bg-blue-700 focus:text-white rounded-full font-medium",
        day_today: "border-2 border-green-500 text-green-700 font-semibold",
        day_outside:
          "day-outside text-slate-400 opacity-40 aria-selected:bg-blue-50 aria-selected:text-slate-500",
        day_disabled: "text-slate-300 opacity-30 cursor-not-allowed",
        day_range_middle:
          "aria-selected:bg-blue-100 aria-selected:text-blue-900 rounded-none",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...props }: { orientation?: "left" | "right" | "up" | "down"; className?: string; size?: number; disabled?: boolean }) =>
          orientation === "left" ? (
            <ChevronLeft className="h-3 w-3" {...props} />
          ) : (
            <ChevronRight className="h-3 w-3" {...props} />
          ),
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };