import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { Trash2, Edit, Plus, Users, Calendar, UserPlus } from 'lucide-react';

import { users as usersApi, events as eventsApi } from '../../utils/api';
import { Event, User } from '../../types/index';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { useAuth } from '../../contexts/AuthContext';
import Modal from '../../components/ui/Modal';
import { toast } from 'react-hot-toast';

type TabType = 'events' | 'users';

const AdminPage: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState<TabType>('events');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'event' | 'user' } | null>(null);

    const {
        data: eventsData,
        isLoading: isLoadingEvents,
        isError: isEventsError,
        error: eventsError,
    } = useQuery<Event[]>({
        queryKey: ['admin-events'],
        queryFn: async () => (await eventsApi.getAll()).data,
        enabled: activeTab === 'events',
    });

    const {
        data: usersData,
        isLoading: isLoadingUsers,
        isError: isUsersError,
        error: usersError,
    } = useQuery<User[]>({
        queryKey: ['admin-users'],
        queryFn: async () => (await usersApi.getProfile()).data,
        enabled: activeTab === 'users',
    });

    const deleteMutation = useMutation<void, Error, { id: string; type: 'event' | 'user' }>({
        mutationFn: async ({ id, type }) => {
            if (type === 'event') {
                await eventsApi.delete(id);
            } else {
                // await usersApi.delete(id);
            }
        },
        onSuccess: (_, { type }) => {
            queryClient.invalidateQueries({ queryKey: [type === 'event' ? 'admin-events' : 'admin-users'] });
            toast.success(`${type === 'event' ? 'Event' : 'User'} deleted successfully`);
        },
        onError: (error: Error) => {
            toast.error(`Failed to delete: ${error.message}`);
        },
    });

    if (currentUser?.role !== 'admin') {
        navigate('/');
        return null;
    }
    const handleDeleteClick = (id: string, type: 'event' | 'user') => {
        setItemToDelete({ id, type });
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            deleteMutation.mutate(itemToDelete);
        }
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
    };

    const isLoading = activeTab === 'events' ? isLoadingEvents : isLoadingUsers;
    const isError = activeTab === 'events' ? isEventsError : isUsersError;
    const error = activeTab === 'events' ? eventsError : usersError;

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (isError) {
        return (
            <ErrorMessage
                title="Error loading data"
                description={error instanceof Error ? error.message : 'An unknown error occurred'}
            />
        );
    }

    return (
        <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <div className="md:flex md:items-center md:justify-between">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                            Admin Dashboard
                        </h2>
                    </div>
                    <div className="mt-4 flex md:mt-0 md:ml-4">
                        {activeTab === 'events' ? (
                            <Link to="/events/new">
                                <Button
                                    variant="primary"
                                    leftIcon={<Plus className="h-4 w-4" />}
                                >
                                    New Event
                                </Button>
                            </Link>

                        ) : (
                            <Link to="/admin/users/new">
                                <Button
                                    variant="primary"
                                    leftIcon={<UserPlus className="h-4 w-4" />}
                                >
                                    Add User
                                </Button>
                            </Link>

                        )}
                    </div>
                </div>

                <div className="mt-6 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('events')}
                            className={`${activeTab === 'events'
                                    ? 'border-primary-500 text-primary-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            <div className="flex items-center">
                                <Calendar className="mr-2 h-5 w-5" />
                                Events
                                {eventsData && (
                                    <span className="ml-2 bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                                        {eventsData.length}
                                    </span>
                                )}
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`${activeTab === 'users'
                                    ? 'border-primary-500 text-primary-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            <div className="flex items-center">
                                <Users className="mr-2 h-5 w-5" />
                                Users
                                {usersData && (
                                    <span className="ml-2 bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                                        {usersData.length}
                                    </span>
                                )}
                            </div>
                        </button>
                    </nav>
                </div>

                <div className="mt-6">
                    {activeTab === 'events' ? (
                        <div className="bg-white shadow overflow-hidden sm:rounded-md">
                            {eventsData && eventsData.length > 0 ? (
                                <ul className="divide-y divide-gray-200">
                                    {eventsData.map((event) => (
                                        <li key={event.id}>
                                            <div className="px-4 py-4 flex items-center sm:px-6">
                                                <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                                                    <div className="truncate">
                                                        <div className="flex text-sm">
                                                            <p className="font-medium text-primary-600 truncate">
                                                                {event.title}
                                                            </p>
                                                            <p className="ml-1 flex-shrink-0 font-normal text-gray-500">
                                                                in {event.location}
                                                            </p>
                                                        </div>
                                                        <div className="mt-2 flex">
                                                            <div className="flex items-center text-sm text-gray-500">
                                                                <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                                                <p>
                                                                    {new Date(event.date).toLocaleDateString()} at {event.time}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                                                        <div className="flex space-x-3">
                                                            <Link to={`/events/${event.id}/edit`}>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    leftIcon={<Edit className="h-3.5 w-3.5" />}
                                                                >
                                                                    Edit
                                                                </Button>
                                                            </Link>

                                                            <Button
                                                                variant="danger"
                                                                size="sm"
                                                                leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                                                                onClick={() => handleDeleteClick(event.id.toString(), 'event')}
                                                            >
                                                                Delete
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-12">
                                    <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No events</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Get started by creating a new event.
                                    </p>
                                    <div className="mt-6">
                                        <Link to="/events/new">
                                            <Button
                                                variant="primary"
                                                leftIcon={<Plus className="h-4 w-4" />}
                                            >
                                                New Event
                                            </Button>
                                        </Link>

                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white shadow overflow-hidden sm:rounded-md">
                            {usersData && usersData.length > 0 ? (
                                <ul className="divide-y divide-gray-200">
                                    {usersData.map((user) => (
                                        <li key={user.id}>
                                            <div className="px-4 py-4 flex items-center sm:px-6">
                                                <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                                                    <div className="truncate">
                                                        <div className="flex text-sm">
                                                            <p className="font-medium text-primary-600 truncate">
                                                                {user.name}
                                                            </p>
                                                            <p className="ml-1 flex-shrink-0 font-normal text-gray-500">
                                                                {user.email}
                                                            </p>
                                                        </div>
                                                        <div className="mt-2 flex">
                                                            <div className="flex items-center text-sm text-gray-500">
                                                                <span
                                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin'
                                                                            ? 'bg-purple-100 text-purple-800'
                                                                            : 'bg-green-100 text-green-800'
                                                                        }`}
                                                                >
                                                                    {user.role}
                                                                </span>
                                                                <span className="ml-2">
                                                                Member since {new Date(user.created_at || '').toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                                                        <div className="flex space-x-3">
                                                            <Link to={`/admin/users/${user.id}/edit`}>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    leftIcon={<Edit className="h-3.5 w-3.5" />}
                                                                >
                                                                    Edit
                                                                </Button>
                                                            </Link>

                                                            {user.id !== currentUser?.id && (
                                                                <Button
                                                                    variant="danger"
                                                                    size="sm"
                                                                    leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                                                                    onClick={() => handleDeleteClick(user.id.toString(), 'user')}
                                                                >
                                                                    Delete
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-12">
                                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No users</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Get started by creating a new user.
                                    </p>
                                    <div className="mt-6">
                                        <Link to="/admin/users/new">
                                            <Button
                                                variant="primary"
                                                leftIcon={<UserPlus className="h-4 w-4" />}
                                            >
                                                Add User
                                            </Button>
                                        </Link>

                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setItemToDelete(null);
                }}
                title={`Delete ${itemToDelete?.type}`}
                actions={{
                    confirm: {
                        label: 'Delete',
                        action: confirmDelete,
                        variant: 'danger',
                        loading: deleteMutation.isPending,
                    },
                    cancel: {
                        label: 'Cancel',
                        action: () => {
                            setIsDeleteModalOpen(false);
                            setItemToDelete(null);
                        },
                        disabled: deleteMutation.isPending,
                    },
                }}
            >
                <p className="text-sm text-gray-500">
                    Are you sure you want to delete this {itemToDelete?.type}? This action cannot be undone.
                </p>
            </Modal>
        </div>
    );
};

export default AdminPage;