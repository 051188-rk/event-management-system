import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Event } from '../../types/index';
import { events } from '../../utils/api';
import FormInput from '../../components/form/FormInput';
import FormTextarea from '../../components/form/FormTextarea';
import FormSelect from '../../components/form/FormSelect';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';

const eventSchema = yup.object().shape({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  date: yup.string().required('Date is required'),
  time: yup.string().required('Time is required'),
  location: yup.string().required('Location is required'),
  capacity: yup
    .number()
    .typeError('Capacity must be a number')
    .positive('Capacity must be positive')
    .integer('Capacity must be an integer')
    .required('Capacity is required'),
  price: yup
    .number()
    .typeError('Price must be a number')
    .min(0, 'Price cannot be negative')
    .required('Price is required'),
  category: yup.string().required('Category is required'),
});

type EventFormData = yup.InferType<typeof eventSchema>;

interface EventFormPageProps {
  editMode?: boolean;
}

const EventFormPage: React.FC<EventFormPageProps> = ({ editMode = false }) => {
  const { id } = useParams<{ id?: string }>();
  const isEdit = editMode || !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EventFormData>({
    resolver: yupResolver(eventSchema),
  });

  const { data: eventData, isLoading: isLoadingEvent } = useQuery<Event, Error>({
      queryKey: ['event', id],
      queryFn: async () => (await events.getById(id!)).data,
      enabled: isEdit,
    }
  );

  useEffect(() => {
    if (isEdit && eventData) {
      reset({
        title: eventData.title,
        description: eventData.description,
        date: eventData.date.split('T')[0],
        time: eventData.time,
        location: eventData.location,
        capacity: eventData.capacity,
        price: eventData.price,
        category: eventData.category,
      });
    }
  }, [isEdit, eventData, reset]);

  const createEvent = useMutation({
    mutationFn: events.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event created successfully');
      navigate('/events');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create event');
    },
  });

  const updateEvent = useMutation({
      mutationFn: (data: EventFormData) => events.update(id!, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['events'] });
        queryClient.invalidateQueries({ queryKey: ['event', id] });
        toast.success('Event updated successfully');
        navigate(`/events/${id}`);
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to update event');
      },
    }
  );

  const onSubmit: SubmitHandler<EventFormData> = (data) => {
    if (isEdit) {
      updateEvent.mutate(data);
    } else {
      createEvent.mutate(data);
    }
  };

  if (isEdit && isLoadingEvent) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            {isEdit ? 'Edit Event' : 'Create New Event'}
          </h2>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Event Information
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {isEdit ? 'Update the event details below.' : 'Fill in the details to create a new event.'}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <FormInput
                label="Event Title"
                id="title"
                type="text"
                error={errors.title?.message}
                {...register('title')}
              />
            </div>

            <div className="sm:col-span-6">
              <FormTextarea
                label="Description"
                id="description"
                rows={4}
                error={errors.description?.message}
                {...register('description')}
              />
            </div>

            <div className="sm:col-span-3">
              <FormInput
                label="Date"
                id="date"
                type="date"
                error={errors.date?.message}
                {...register('date')}
              />
            </div>

            <div className="sm:col-span-3">
              <FormInput
                label="Time"
                id="time"
                type="time"
                error={errors.time?.message}
                {...register('time')}
              />
            </div>

            <div className="sm:col-span-6">
              <FormInput
                label="Location"
                id="location"
                type="text"
                error={errors.location?.message}
                {...register('location')}
              />
            </div>

            <div className="sm:col-span-3">
              <FormInput
                label="Capacity"
                id="capacity"
                type="number"
                min="1"
                error={errors.capacity?.message}
                {...register('capacity')}
              />
            </div>

            <div className="sm:col-span-3">
              <FormInput
                label="Price ($)"
                id="price"
                type="number"
                step="0.01"
                min="0"
                error={errors.price?.message}
                {...register('price')}
              />
            </div>

            <div className="sm:col-span-3">
              <FormSelect
                label="Category"
                id="category"
                error={errors.category?.message}
                {...register('category')}
                options={[
                  { value: 'conference', label: 'Conference' },
                  { value: 'workshop', label: 'Workshop' },
                  { value: 'seminar', label: 'Seminar' },
                  { value: 'meetup', label: 'Meetup' },
                  { value: 'networking', label: 'Networking' },
                  { value: 'other', label: 'Other' },
                ]}
              />
            </div>
          </div>

          <div className="pt-5">
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(isEdit ? `/events/${id}` : '/events')}
                disabled={createEvent.isPending || updateEvent.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={createEvent.isPending || updateEvent.isPending}
              >
                {isEdit ? 'Update Event' : 'Create Event'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventFormPage;