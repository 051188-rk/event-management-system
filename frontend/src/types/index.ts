// src/types/index.ts

// User related types
export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'user';
    is_active: boolean;
    created_at: string;
    updated_at: string;
  }
  
  export interface UserCreateData {
    name: string;
    email: string;
    password: string;
    role?: 'admin' | 'user';
  }
  
  export interface UserUpdateData {
    name?: string;
    email?: string;
    password?: string;
  }
  
  // Event related types
  export interface Event {
    id: number;
    title: string;
    description: string;
    date: string; // ISO date string
    time: string; // HH:MM format
    location: string;
    capacity: number;
    registration_deadline: string; // ISO date string
    additional_info?: string;
    image_url: string | null;
    created_by_id: number;
    created_at: string;
    updated_at: string;
    created_by?: User; // Nested user data
    imageUrl?: string | null;
    user?: User; // To match what EventDetailPage expects
    price: number;
    category: string;
    [key: string]: any;
  }
  
  export interface EventCreateData {
    title: string;
    description: string;
    date: string; // ISO date string
    time: string; // HH:MM format
    image_url?: string;
  }
  
  export interface EventUpdateData extends Partial<EventCreateData> {}
  
  // Auth related types
  export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  export interface AuthResponse {
    access_token: string;
    token_type: string;
    user: User;
  }
  
  // API response types
  export interface ApiResponse<T> {
    data: T;
    message?: string;
    success: boolean;
  }
  
  export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    size: number;
    pages: number;
  }
  
  // Form related types
  export interface FormFieldProps {
    name: string;
    label: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    options?: { value: string; label: string }[];
    className?: string;
  }
  
  // Component props
  export interface LayoutProps {
    children: React.ReactNode;
  }
  
  export interface ProtectedRouteProps {
    children: React.ReactNode;
    adminOnly?: boolean;
  }
  
  // Utility types
  export type Nullable<T> = T | null;
  
  export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;