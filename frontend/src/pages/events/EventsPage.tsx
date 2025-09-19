import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { Calendar, Clock, Plus } from 'lucide-react';

import { Event } from '../../types/index';
import { events } from '../../utils/api';
import Button from '../../components/ui/Button';
import EventFilters from '../../components/events/EventFilters';
import EventCard from '../../components/events/EventCard';
import Pagination from '../../components/ui/Pagination';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

type EventFiltersType = {
  search: string;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
};

const EventsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<EventFiltersType>({
    search: '',
    dateRange: {
      start: null,
      end: null,
    },
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['events', page, filters],
    queryFn: () =>
      events.getAll({
        page,
        search: filters.search,
        start_date: filters.dateRange.start?.toISOString(),
        end_date: filters.dateRange.end?.toISOString(),
      }),
    // keepPreviousData: true,
  });

  const handleSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search }));
    setPage(1);
  };

  const handleDateRangeChange = (dateRange: { start: Date | null; end: Date | null }) => {
    setFilters((prev) => ({
      ...prev,
      dateRange,
    }));
    setPage(1);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-red-600">
          Error loading events. Please try again later.
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          <p className="mt-2 text-sm text-gray-700">
            Browse and manage upcoming events.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Link to="/events/new">
            <Button  leftIcon={<Plus size={18} />}>
            New Event
          </Button>
            </Link>
          
        </div>
      </div>

      <EventFilters
        search={filters.search}
        onSearchChange={handleSearch}
        dateRange={filters.dateRange}
        onDateRangeChange={handleDateRangeChange}
      />

      {data?.data.length === 0 ? (
        <EmptyState
          title="No events found"
          description="Try adjusting your search or create a new event."
          action={
            <Link to="/events/new">
            <Button variant="primary">
              Create Event
            </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data?.data.map((event: Event) => (
            <EventCard key={event.id} event={event as any} />
          ))}
        </div>
      )}

      {data && data.data.length > 0 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
            //   disabled={!data?.has_next}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(page - 1) * 10 + 1}</span> to{' '}
                <span className="font-medium">
                  {/* {Math.min(page * 10, data?.total || 0)} */}
                </span>{' '}
                of <span className="font-medium">{data?.data.length}</span> results
              </p>
            </div>
            <Pagination
              currentPage={page}
              totalPages={Math.ceil((data?.data.length || 0) / 10)}
              onPageChange={setPage}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsPage;