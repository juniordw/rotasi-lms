// src/types/user.ts
export interface User {
  id: number;
  full_name: string;
  username: string;
  email: string;
  department: string;
  role: string;
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
  last_login?: string;
}

export interface UserFormData {
  full_name: string;
  username: string;
  email: string;
  department: string;
}

export interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}