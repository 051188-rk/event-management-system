import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { format, parseISO } from 'date-fns';
import { Calendar as CalendarIcon, Clock, Image as ImageIcon, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { Event } from '../../types';
import api, { events } from '../../utils/api';
import FormInput from '../form/FormInput';
import FormTextarea from '../form/FormTextarea';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorMessage from '../ui/ErrorMessage';
import { useAuth } from '../../contexts/AuthContext';

// Define the form values type
type EventFormValues = {
  title: string;
  description: string;
  date: Date;
  time: string;
  location: string;
  capacity: number | string;
  registration_deadline: Date;
  additional_info?: string;
};

// Create the schema with proper typing
const eventSchema = yup.object().shape<Record<keyof EventFormValues, any>>({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  date: yup.date().required('Date is required'),
  time: yup
    .string()
    .required('Time is required')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time (HH:MM)'),
  location: yup.string().required('Location is required'),
  capacity: yup
    .mixed()
    .test('is-number', 'Capacity must be a number', (value) => !isNaN(Number(value)))
    .test('is-positive', 'Capacity must be positive', (value) => Number(value) > 0)
    .test('is-integer', 'Capacity must be a whole number', (value) => Number.isInteger(Number(value)))
    .required('Capacity is required'),
  registration_deadline: yup.date().required('Registration deadline is required'),
  additional_info: yup.string().optional(),
});

type EventFormData = yup.InferType<typeof eventSchema>;

interface EventFormProps {
  event?: Event;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const EventForm: React.FC<EventFormProps> = ({ event, onSuccess, onCancel }) => {
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(
    event?.imageUrl || null
  );
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Create default values with proper typing
  const defaultValues = React.useMemo<EventFormValues>(() => {
    if (event) {
      // Use type assertion to handle the Event type
      const eventData = event as any;
      return {
        title: eventData.title,
        description: eventData.description,
        date: parseISO(eventData.date),
        time: eventData.time,
        location: eventData.location,
        capacity: eventData.capacity,
        registration_deadline: parseISO(eventData.registration_deadline),
        additional_info: eventData.additional_info,
      };
    }

    return {
      title: '',
      description: '',
      date: new Date(),
      time: '19:00',
      location: '',
      capacity: 100,
      registration_deadline: new Date(),
      additional_info: '',
    };
  }, [event]);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<EventFormValues>({
    resolver: yupResolver(eventSchema) as any, // Type assertion to handle the resolver type
    defaultValues,
  });

  // Helper function to get error message
  const getErrorMessage = (field: keyof EventFormValues) => {
    const error = errors[field];
    return error ? String(error.message) : undefined;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setPreviewImage(null);
    setImageFile(null);
  };

  const onSubmit = async (formData: EventFormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Convert form data to API payload
      const payload: Record<string, any> = {
        title: formData.title,
        description: formData.description,
        date: format(formData.date, 'yyyy-MM-dd'),
        time: formData.time,
        location: formData.location,
        capacity: Number(formData.capacity),
        registration_deadline: format(formData.registration_deadline, 'yyyy-MM-dd'),
      };

      // Only include additional_info if it has a value
      if (formData.additional_info) {
        payload.additional_info = formData.additional_info;
      }

      let response;

      // Handle image upload if a new file was selected
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        
        // Add all other form fields to FormData
        Object.entries(payload).forEach(([key, value]) => {
          formData.append(key, String(value));
        });

        if (event?.id) {
          // Update existing event with image
          response = await api.patch(`/events/${event.id}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        } else {
          // Create new event with image
          response = await api.post('/events', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        }
      } else {
        // No image to upload, just update/create the event
        if (event?.id) {
          response = await events.update(event.id, payload);
        } else {
          response = await events.create(payload);
        }
      }

      toast.success(`Event ${event?.id ? 'updated' : 'created'} successfully`);
      onSuccess?.();
    } catch (err) {
      console.error('Error saving event:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while saving the event';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            {event ? 'Edit Event' : 'Create New Event'}
          </h3>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
          {error && <ErrorMessage title="Error" description={error} />}

          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            {/* Event Title */}
            <div className="sm:col-span-6">
              <FormInput
                id="title"
                label="Event Title"
                placeholder="Enter event title"
                {...register('title')}
                error={getErrorMessage('title')}
                required
              />
            </div>

            {/* Event Description */}
            <div className="sm:col-span-6">
              <FormTextarea
                id="description"
                label="Description"
                rows={4}
                placeholder="Enter event description"
                {...register('description')}
                error={getErrorMessage('description')}
                required
              />
            </div>

            {/* Event Image */}
            <div className="sm:col-span-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Image
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {previewImage ? (
                    <div className="relative">
                      <img
                        src={previewImage}
                        alt="Event preview"
                        className="mx-auto h-48 w-full object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="image-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                        >
                          <span>Upload an image</span>
                          <input
                            id="image-upload"
                            name="image-upload"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Date and Time */}
            <div className="sm:col-span-3">
              <FormInput
                id="date"
                type="date"
                label="Event Date"
                {...register('date')}
                error={getErrorMessage('date')}
              />
            </div>

            <div className="sm:col-span-3">
              <FormInput
                id="time"
                type="time"
                label="Start Time"
                {...register('time')}
                error={getErrorMessage('time')}
              />
            </div>

            {/* Location and Capacity */}
            <div className="sm:col-span-4">
              <FormInput
                id="location"
                label="Location"
                placeholder="Enter event location"
                {...register('location')}
                error={getErrorMessage('location')}
              />
            </div>

            <div className="sm:col-span-2">
              <FormInput
                id="capacity"
                type="number"
                min="1"
                label="Capacity"
                placeholder="100"
                {...register('capacity')}
                error={getErrorMessage('capacity')}
                required
              />
            </div>

            {/* Registration Deadline */}
            <div className="sm:col-span-6">
              <FormInput
                id="registration_deadline"
                type="date"
                label="Registration Deadline"
                error={errors.registration_deadline?.message}
                {...register('registration_deadline')}
              />
            </div>

            {/* Additional Information */}
            <div className="sm:col-span-6">
              <FormTextarea
                id="additional_info"
                label="Additional Information (Optional)"
                rows={3}
                placeholder="Any additional details attendees should know..."
                error={errors.additional_info?.message}
                {...register('additional_info')}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {event ? (
                'Update Event'
              ) : (
                'Create Event'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;