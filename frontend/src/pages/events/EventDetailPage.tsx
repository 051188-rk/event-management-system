import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { Calendar, Clock, MapPin, Users, Edit, Trash2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { events } from '../../utils/api';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { useAuth } from '../../contexts/AuthContext';
import { Event } from '../../types/index';

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAdmin } = useAuth();

  const {
    data: event,
    isLoading,
    isError,
    error,
  } = useQuery<Event, Error>({
    queryKey: ['event', id],
    queryFn: async () => (await events.getById(id!)).data,
    enabled: !!id,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return (
      <ErrorMessage
        title="Error loading event"
        description={error instanceof Error ? error.message : 'An unknown error occurred'}
      />
    );
  }

  if (!event) {
    return <ErrorMessage title="Event not found" description="The requested event could not be found." />;
  }

  const eventDate = parseISO(event.date);
  const formattedDate = format(eventDate, 'EEEE, MMMM d, yyyy');
  const formattedTime = event.time; // Assuming time is in HH:MM format

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header with image and basic info */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="h-64 bg-gray-200 relative overflow-hidden">
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-primary-100 to-secondary-100 flex items-center justify-center">
              <span className="text-6xl font-bold text-gray-400">
                {event.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          
          {/* Admin actions */}
          {isAdmin && (
            <div className="absolute top-4 right-4 flex space-x-2">
                <Link to={`/events/${event.id}/edit`}>
                <Button
                variant="outline"
                size="sm"
                className="bg-white/90 backdrop-blur-sm"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
                </Link>
              
              <Button
                variant="danger"
                size="sm"
                className="bg-white/90 backdrop-blur-sm"
                onClick={() => {
                  // Handle delete
                }}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          )}
        </div>
        
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
            <div className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              Upcoming
            </div>
          </div>
          
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <span>Hosted by </span>
            <span className="ml-1 font-medium text-gray-900">
              {event.user?.name || 'Organizer'}
            </span>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-4">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-5 w-5 text-gray-400 mr-1.5" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-5 w-5 text-gray-400 mr-1.5" />
              <span>{formattedTime}</span>
            </div>
            {event.location && (
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-5 w-5 text-gray-400 mr-1.5" />
                <span>{event.location}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="px-6 py-5">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-2/3">
              <h2 className="text-lg font-medium text-gray-900 mb-3">About this event</h2>
              <div className="prose max-w-none text-gray-600">
                {event.description.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
              
              {/* {event.additional_info && (
                <div className="mt-8">
                  <h3 className="text-md font-medium text-gray-900 mb-3">Additional Information</h3>
                  <div className="prose max-w-none text-gray-600">
                    {event.additional_info}
                  </div>
                </div>
              )} */}
            </div>
            
            <div className="md:w-1/3">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">When & Where</h3>
                  <button className="text-sm text-primary-600 hover:text-primary-500">
                    Add to calendar
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{formattedDate}</p>
                      <p className="text-sm text-gray-500">{formattedTime}</p>
                    </div>
                  </div>
                  
                  {event.location && (
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">Location</p>
                        <p className="text-sm text-gray-500">{event.location}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Users className="h-5 w-5 text-gray-400" />
                        <span className="ml-2 text-sm text-gray-600">
                          {/* {event.attendee_count || 0} attending */}
                        </span>
                      </div>
                      <Button variant="primary" >
                        RSVP
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-yellow-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      {/* Registration ends {format(parseISO(event.registration_deadline), 'MMMM d, yyyy')} */}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Related events section */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-gray-900 mb-6">You might also like</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Map through related events */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="h-32 bg-gray-200"></div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900">Related Event {i}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {format(new Date(Date.now() + i * 86400000), 'EEEE, MMM d, yyyy')}
                </p>
                <Button variant="outline" size="sm" className="mt-3 w-full">
                  View details
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;