import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Event } from '../../types';

import EventForm from '../../components/events/EventForm';
import { useAuth } from '../../contexts/AuthContext';
import { events } from '../../utils/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';

const EventEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const data = await events.getById(id);
        setEvent(data.data);
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Failed to load event. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleSubmitSuccess = () => {
    toast.success('Event updated successfully!');
    navigate(`/events/${id}`);
  };

  const handleCancel = () => {
    navigate(`/events/${id}`);
  };

  // Redirect if not admin
  if (currentUser?.role !== 'admin') {
    navigate('/events');
    return null;
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage title="Error loading event" description={error} />;
  }

  if (!event) {
    return <ErrorMessage title="Event not found" description="The requested event could not be found." />;
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Edit Event</h1>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="py-4">
          <EventForm 
            event={event} 
            onSuccess={handleSubmitSuccess} 
            onCancel={handleCancel} 
          />
        </div>
      </div>
    </div>
  );
};

export default EventEditPage;