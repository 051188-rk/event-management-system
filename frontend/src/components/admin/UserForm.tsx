import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { User } from '../../types/index';
import { users } from '../../utils/api';
import FormInput from '../form/FormInput';
import FormSelect from '../form/FormSelect';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorMessage from '../ui/ErrorMessage';

type UserRole = 'user' | 'admin';

// Form values type
type UserFormValues = {
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  password_confirmation?: string;
};

// Type for form submission
type UserFormData = Omit<UserFormValues, 'password_confirmation'> & {
  password_confirmation?: string;
};

// Create a schema for the form
const userSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  role: yup.mixed<UserRole>().oneOf(['user', 'admin']).required('Role is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .when('$isEdit', {
      is: true,
      then: (schema) => schema.optional(),
      otherwise: (schema) => schema.required('Password is required'),
    }),
  password_confirmation: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .when('password', {
      is: (val: string) => val && val.length > 0,
      then: (schema) => schema.required('Please confirm your password'),
    }),
});

interface UserFormProps {
  user?: User;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSuccess, onCancel }) => {
  const isEdit = !!user;
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormValues, any, UserFormData>({
    resolver: yupResolver(userSchema as any) as any,
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      role: (user?.role as UserRole) || 'user',
      password: '',
      password_confirmation: '',
    },
  });

  const onSubmit: SubmitHandler<UserFormData> = async (data) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const userData: any = {
        name: data.name,
        email: data.email,
        role: data.role,
      };

      if (data.password) {
        userData.password = data.password;
        userData.password_confirmation = data.password_confirmation;
      }

      if (isEdit && user) {
        // await users.update(user.id.toString(), userData);
      } else {
        // await users.create(userData);
      }

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Error saving user:', err);
      setError(
        err instanceof Error ? err.message : 'An error occurred while saving the user.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            {isEdit ? 'Edit User' : 'Add New User'}
          </h3>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
          {error && <ErrorMessage title="Error" description={error} />}

          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <FormInput
                id="name"
                label="Full Name"
                placeholder="Enter full name"
                error={errors.name?.message}
                {...register('name')}
              />
            </div>

            <div className="sm:col-span-6">
              <FormInput
                id="email"
                type="email"
                label="Email Address"
                placeholder="Enter email address"
                error={errors.email?.message}
                {...register('email')}
                disabled={isEdit}
              />
            </div>

            <div className="sm:col-span-6">
              <FormSelect
                id="role"
                label="Role"
                error={errors.role?.message}
                {...register('role')}
                options={[
                  { value: 'user', label: 'User' },
                  { value: 'admin', label: 'Administrator' },
                ]}
              />
            </div>

            <div className="sm:col-span-6">
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-4">
                  {isEdit ? 'Change Password' : 'Set Password'}
                </h4>
                <p className="text-sm text-gray-500 mb-4">
                  {isEdit
                    ? 'Leave blank to keep current password.'
                    : 'Set a password for the new user.'}
                </p>

                <div className="space-y-4">
                  <FormInput
                    id="password"
                    type="password"
                    label="Password"
                    placeholder="Enter password"
                    error={errors.password?.message}
                    {...register('password')}
                  />

                  <FormInput
                    id="password_confirmation"
                    type="password"
                    label="Confirm Password"
                    placeholder="Confirm password"
                    error={errors.password_confirmation?.message}
                    {...register('password_confirmation')}
                  />
                </div>
              </div>
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
              {isEdit ? (
                'Update User'
              ) : (
                'Create User'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;