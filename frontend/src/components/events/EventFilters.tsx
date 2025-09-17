import React, { useState } from 'react';
import { Calendar, Search, X } from 'lucide-react';
import { DateRange, DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns';

import { cn } from '../../lib/utils';
import Button from '../ui/Button';
import { Input } from '../ui/Input';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/Popover';

interface EventFiltersProps {
  search: string;
  onSearchChange: (search: string) => void;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  onDateRangeChange: (dateRange: { start: Date | null; end: Date | null }) => void;
}

const EventFilters: React.FC<EventFiltersProps> = ({
  search,
  onSearchChange,
  dateRange,
  onDateRangeChange,
}) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleSelect = (range: DateRange | undefined) => {
    if (range) {
      onDateRangeChange({
        start: range.from || null,
        end: range.to || null,
      });
    }
  };

  const clearDateFilter = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDateRangeChange({ start: null, end: null });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search events..."
            className="pl-10 w-full"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'justify-start text-left font-normal',
                !dateRange.start && 'text-muted-foreground'
              )}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {dateRange.start ? (
                dateRange.end ? (
                  <>
                    {format(dateRange.start, 'MMM d, yyyy')} -{' '}
                    {format(dateRange.end, 'MMM d, yyyy')}
                  </>
                ) : (
                  format(dateRange.start, 'MMM d, yyyy')
                )
              ) : (
                <span>Pick a date range</span>
              )}
              {(dateRange.start || dateRange.end) && (
                <button
                  onClick={clearDateFilter}
                  className="ml-2 p-1 rounded-full hover:bg-gray-100"
                >
                  <X className="h-3 w-3 text-gray-500" />
                </button>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <DayPicker
              initialFocus
              mode="range"
              defaultMonth={dateRange.start || new Date()}
              selected={{
                from: dateRange.start || undefined,
                to: dateRange.end || undefined,
              }}
              onSelect={handleSelect}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

      {(search || dateRange.start || dateRange.end) && (
        <div className="flex items-center gap-2 flex-wrap">
          {search && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {search}
              <button
                type="button"
                className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none"
                onClick={() => onSearchChange('')}
              >
                <span className="sr-only">Remove search term</span>
                <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                  <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                </svg>
              </button>
            </span>
          )}

          {dateRange.start && dateRange.end && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {format(dateRange.start, 'MMM d')} - {format(dateRange.end, 'MMM d, yyyy')}
              <button
                type="button"
                className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-green-400 hover:bg-green-200 hover:text-green-500 focus:outline-none"
                onClick={() => onDateRangeChange({ start: null, end: null })}
              >
                <span className="sr-only">Remove date filter</span>
                <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                  <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                </svg>
              </button>
            </span>
          )}

          {(search || dateRange.start || dateRange.end) && (
            <button
              type="button"
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
              onClick={() => {
                onSearchChange('');
                onDateRangeChange({ start: null, end: null });
              }}
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EventFilters;