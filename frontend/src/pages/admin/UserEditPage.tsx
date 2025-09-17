import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { User } from '../../types';

import UserForm from '../../components/admin/UserForm';
import { useAuth } from '../../contexts/AuthContext';
import { users } from '../../utils/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';

const UserEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        // const data = await users.getById(id);
        // setUser(data);
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('Failed to load user. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleSubmitSuccess = () => {
    toast.success('User updated successfully!');
    navigate('/admin');
  };

  const handleCancel = () => {
    navigate('/admin');
  };

  // Redirect if not admin
  if (currentUser?.role !== 'admin') {
    navigate('/');
    return null;
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage title="Error loading user" description={error} />;
  }

  if (!user) {
    return <ErrorMessage title="User not found" description="The requested user could not be found." />;
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Edit User</h1>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="py-4">
          <UserForm 
            user={user} 
            onSuccess={handleSubmitSuccess} 
            onCancel={handleCancel} 
          />
        </div>
      </div>
    </div>
  );
};

export default UserEditPage;