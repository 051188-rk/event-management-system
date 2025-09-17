import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import EventForm from '../../components/events/EventForm';
import { useAuth } from '../../contexts/AuthContext';
import { events } from '../../utils/api';

const EventCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleSubmitSuccess = () => {
    toast.success('Event created successfully!');
    navigate('/events');
  };

  const handleCancel = () => {
    navigate('/events');
  };

  // Redirect if not admin
  if (currentUser?.role !== 'admin') {
    navigate('/events');
    return null;
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Create New Event</h1>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="py-4">
          <EventForm onSuccess={handleSubmitSuccess} onCancel={handleCancel} />
        </div>
      </div>
    </div>
  );
};

export default EventCreatePage;
