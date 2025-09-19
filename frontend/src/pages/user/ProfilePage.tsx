import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../types/index';
import FormInput from '../../components/form/FormInput';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

type ProfileFormData = {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

const profileSchema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  currentPassword: yup.string().default('').required(),
  newPassword: yup.string()
    .when('currentPassword', {
      is: (val: string) => !!val && val.length > 0,
      then: (schema) => schema
        .min(8, 'Password must be at least 8 characters')
        .required('New password is required'),
    })
    .default('')
    .required(),
  confirmNewPassword: yup.string()
    .when('newPassword', {
      is: (val: string) => !!val && val.length > 0,
      then: (schema) => schema
        .oneOf([yup.ref('newPassword')], 'Passwords must match')
        .required('Please confirm your new password'),
    })
    .default('')
    .required(),
});

const ProfilePage: React.FC = () => {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const form = useForm<ProfileFormData>({
    resolver: yupResolver(profileSchema) as any,
    defaultValues: {
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const { register, handleSubmit, formState: { errors }, reset, watch } = form;
  const currentPassword = watch('currentPassword');
  const newPassword = watch('newPassword');

  const onSubmit: SubmitHandler<ProfileFormData> = async (data) => {
    try {
      setIsLoading(true);
      setError('');
      
      // Only include password fields if currentPassword is provided
      const updateData: Partial<User> & { currentPassword?: string; newPassword?: string } = {
        name: data.name,
        email: data.email,
      };

      if (data.currentPassword) {
        updateData.currentPassword = data.currentPassword;
        if (data.newPassword) {
          updateData.newPassword = data.newPassword;
        }
      }

    //   await updateProfile(updateData);
      toast.success('Profile updated successfully');
      reset({
        name: data.name,
        email: data.email,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Profile Settings
          </h2>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Personal Information</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Update your account information.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 px-4 py-5 sm:p-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <FormInput
                label="Full name"
                id="name"
                type="text"
                autoComplete="name"
                error={errors.name?.message}
                {...register('name')}
              />
            </div>

            <div className="sm:col-span-4">
              <FormInput
                label="Email address"
                id="email"
                type="email"
                autoComplete="email"
                error={errors.email?.message}
                {...register('email')}
              />
            </div>

            <div className="sm:col-span-6 border-t border-gray-200 pt-6">
              <h4 className="text-lg font-medium text-gray-900">Change Password</h4>
              <p className="mt-1 text-sm text-gray-500">
                Leave these fields empty if you don't want to change your password.
              </p>
            </div>

            <div className="sm:col-span-4">
              <FormInput
                label="Current password"
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                error={errors.currentPassword?.message}
                {...register('currentPassword')}
              />
            </div>

            <div className="sm:col-span-4">
              <FormInput
                label="New password"
                id="newPassword"
                type="password"
                autoComplete="new-password"
                error={errors.newPassword?.message}
                {...register('newPassword')}
              />
            </div>

            <div className="sm:col-span-4">
              <FormInput
                label="Confirm new password"
                id="confirmNewPassword"
                type="password"
                autoComplete="new-password"
                error={errors.confirmNewPassword?.message}
                {...register('confirmNewPassword')}
              />
            </div>
          </div>

          <div className="pt-5">
            <div className="flex justify-end">
              <button
                type="button"
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                onClick={() => {
                  reset({
                    name: currentUser?.name || '',
                    email: currentUser?.email || '',
                    currentPassword: '',
                    newPassword: '',
                    confirmNewPassword: '',
                  });
                }}
              >
                Reset
              </button>
              <Button
                type="submit"
                variant="primary"
                className="ml-3"
                isLoading={isLoading}
              >
                Save
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;