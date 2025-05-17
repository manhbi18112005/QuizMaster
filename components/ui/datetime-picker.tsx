// filepath: /Users/myt/Documents/GitHub/learn/components/ui/datetime-picker.tsx
"use client";

import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect } from "react";

import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { ScrollArea } from "./scroll-area";

interface DatetimePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
  fromYear?: number;
  toYear?: number;
}

export function DatetimePicker({
  value,
  onChange,
  disabled,
  fromYear,
  toYear,
}: DatetimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [timeString, setTimeString] = useState<string>("00:00");
  const [calendarDate, setCalendarDate] = useState<Date | undefined>();

  useEffect(() => {
    if (value) {
      // Ensure we're working with a valid Date object for the calendar part
      const datePart = new Date(value.getFullYear(), value.getMonth(), value.getDate());
      setCalendarDate(datePart);
      setTimeString(format(value, "HH:mm"));
    } else {
      setCalendarDate(undefined);
      setTimeString("00:00"); // Default time if no value
    }
  }, [value]);

  const handleDateChange = (selectedDay: Date | undefined) => {
    setCalendarDate(selectedDay); // Update calendar UI immediately
    if (selectedDay) {
      const [hours, minutes] = timeString.split(":").map(Number);
      const newDatetime = new Date(
        selectedDay.getFullYear(),
        selectedDay.getMonth(),
        selectedDay.getDate(),
        hours,
        minutes
      );
      onChange(newDatetime);
    } else {
      onChange(undefined);
    }
    // Keep popover open to select time or close if only date is needed.
    // For this setup, we allow time to be selected after date.
  };

  const handleTimeChange = (newTime: string) => {
    setTimeString(newTime);
    const baseDate = calendarDate || (value ? new Date(value.getFullYear(), value.getMonth(), value.getDate()) : new Date()); // Use calendarDate, or value's date, or today's date part
    
    if (baseDate) {
        const [hours, minutes] = newTime.split(":").map(Number);
        const newDatetime = new Date(
            baseDate.getFullYear(),
            baseDate.getMonth(),
            baseDate.getDate(),
            hours,
            minutes
        );
        // If calendarDate was not set (e.g. value was initially undefined),
        // set it now so the calendar highlights the date part of the new selection.
        if (!calendarDate) {
            setCalendarDate(new Date(newDatetime.getFullYear(), newDatetime.getMonth(), newDatetime.getDate()));
        }
        onChange(newDatetime);
    }
    setIsOpen(false); // Close popover after time selection
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
          {value ? (
            format(value, "PPP, HH:mm")
          ) : (
            <span>Pick a date and time</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 flex items-start"
        align="start"
      >
        <div>
          <Calendar
            mode="single"
            selected={calendarDate}
            onSelect={handleDateChange}
            disabled={disabled}
            fromYear={fromYear}
            toYear={toYear}
            initialFocus
          />
        </div>
        <div className="w-[120px] my-4 mr-2 border-l pl-4 ml-4">
          <ScrollArea className="h-[calc(var(--radix-popover-content-available-height)-2rem)] max-h-[18rem]"> {/* Adjust height dynamically or set fixed */}
            <div className="flex flex-col gap-1">
              {Array.from({ length: 24 * 4 }).map((_, i) => { // 15-minute intervals
                const hour = Math.floor(i / 4).toString().padStart(2, "0");
                const minute = ((i % 4) * 15).toString().padStart(2, "0");
                const timeValue = `${hour}:${minute}`;
                return (
                  <Button
                    key={timeValue}
                    className="w-full text-left px-2 justify-start"
                    variant={timeString === timeValue ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleTimeChange(timeValue)}
                  >
                    {timeValue}
                  </Button>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}