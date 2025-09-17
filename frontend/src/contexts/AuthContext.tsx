import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { User } from '../types';
import api from '../utils/api';

type AuthContextType = {
  currentUser: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Check if user is authenticated on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsLoading(false);
          return;
        }

        // Set the default auth token
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Fetch the current user
        const response = await api.get('/auth/me');
        setCurrentUser(response.data);
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', {
        username: email,
        password,
      });

      const { access_token, user } = response.data;
      
      // Store the token
      localStorage.setItem('token', access_token);
      
      // Set the default auth token for axios
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // Update the current user
      setCurrentUser(user);
      
      // Invalidate any queries that depend on the current user
      await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      
      // Redirect to home page
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      await api.post('/auth/signup', {
        name,
        email,
        password,
        role: 'user',
      });
      
      // After successful signup, log the user in
      await login(email, password);
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  };

  const logout = () => {
    // Clear the token
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    
    // Reset the current user
    setCurrentUser(null);
    
    // Clear all queries
    queryClient.clear();
    
    // Redirect to login page
    navigate('/login');
  };

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    isAdmin: currentUser?.role === 'admin',
    isLoading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
