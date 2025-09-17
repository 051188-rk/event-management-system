import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import UserForm from '../../components/admin/UserForm';
import { useAuth } from '../../contexts/AuthContext';

const UserCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleSubmitSuccess = () => {
    toast.success('User created successfully!');
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

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Add New User</h1>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="py-4">
          <UserForm onSuccess={handleSubmitSuccess} onCancel={handleCancel} />
        </div>
      </div>
    </div>
  );
};

export default UserCreatePage;
