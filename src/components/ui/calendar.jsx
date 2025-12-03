import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  selectingType = "from", // New prop to indicate if selecting from or to date
  ...props
}) {
  return (
    <div className={`calendar-wrapper ${selectingType}-selection-mode`}>
      <style>
        {`
          .from-selection-mode .rdp-caption {
            border-bottom: 2px solid #3b82f6; /* Primary blue color */
          }
          
          .to-selection-mode .rdp-caption {
            border-bottom: 2px solid #ec4899; /* Pink color */
          }
          
          .from-selection-mode .rdp-caption_label::after {
            content: " (From)";
            font-size: 0.8em;
            color: #3b82f6;
            font-weight: normal;
            margin-left: 4px;
          }
          
          .to-selection-mode .rdp-caption_label::after {
            content: " (To)";
            font-size: 0.8em;
            color: #ec4899;
            font-weight: normal;
            margin-left: 4px;
          }
        `}
      </style>
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn('p-3', className)}
        classNames={{
          months: 'flex flex-col justify-center sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
          month: 'space-y-4',
          caption: 'flex justify-center pt-1 relative items-center pb-2',
          caption_label: 'text-sm font-medium',
          nav: 'space-x-1 flex items-center',
          nav_button: cn(
            buttonVariants({
              variant: 'outline'
            }),
            'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'
          ),
          nav_button_previous: 'absolute left-1',
          nav_button_next: 'absolute right-1',
          table: 'w-full border-collapse space-y-1',
          head_row: 'flex',
          head_cell: 'text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]',
          row: 'flex w-full mt-2',
          cell: cn(
            'size-8 text-center text-sm p-0 relative',
            // For range selection:
            '[&:has([aria-selected].day-range-start)]:rounded-l-md',
            '[&:has([aria-selected].day-range-end)]:rounded-r-md',
            '[&:has([aria-selected].day-outside)]:bg-accent/50',
            '[&:has([aria-selected])]:bg-accent'
          ),
          day: cn(
            buttonVariants({
              variant: 'ghost'
            }),
            'size-8 p-0 text-sm font-normal aria-selected:opacity-100'
          ),
          day_selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
          day_today: 'bg-accent text-accent-foreground',
          day_outside: 'day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground',
          day_disabled: 'text-muted-foreground opacity-50',
          day_range_start: 'day-range-start bg-primary text-primary-foreground rounded-l-md',
          day_range_end: 'day-range-end bg-primary text-primary-foreground rounded-r-md',
          day_range_middle: 'day-range-middle aria-selected:bg-accent aria-selected:text-accent-foreground',
          day_hidden: 'invisible',
          ...classNames
        }}
        components={{
          IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
          IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />
        }}
        {...props}
      />
    </div>
  );
}

Calendar.displayName = 'Calendar';

export { Calendar };