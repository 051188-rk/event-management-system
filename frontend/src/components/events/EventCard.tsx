import React from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { Calendar, Clock, User } from 'lucide-react';

interface EventCardProps {
  event: {
    id: number;
    title: string;
    description: string;
    date: string;
    time: string;
    image_url?: string | null;
    created_by?: {
      id: number;
      name: string;
    };
  };
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const eventDate = parseISO(event.date);
  const formattedDate = format(eventDate, 'MMM d, yyyy');
  const formattedDay = format(eventDate, 'EEE');
  const formattedTime = event.time; // Assuming time is already in HH:MM format

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      {/* Event Image */}
      <div className="h-48 bg-gray-200 relative overflow-hidden">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary-100 to-secondary-100 flex items-center justify-center">
            <span className="text-4xl font-bold text-gray-400">
              {event.title.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        
        {/* Date Badge */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 text-center shadow-md">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {formattedDay}
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {format(eventDate, 'd')}
          </div>
          <div className="text-xs font-medium text-gray-500">
            {format(eventDate, 'MMM')}
          </div>
        </div>
      </div>
      
      {/* Event Content */}
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
          <Link to={`/events/${event.id}`} className="hover:text-primary-600 transition-colors">
            {event.title}
          </Link>
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {event.description}
        </p>
        
        <div className="space-y-3 text-sm text-gray-500">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-primary-500" />
            <span>{formattedDate}</span>
          </div>
          
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-primary-500" />
            <span>{formattedTime}</span>
          </div>
          
          {event.created_by && (
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2 text-primary-500" />
              <span>Organized by {event.created_by.name}</span>
            </div>
          )}
        </div>
        
        <div className="mt-6">
          <Link
            to={`/events/${event.id}`}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
