export type UserRole = 'admin' | 'client';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  property_interest: string | null;
  role: UserRole;
  created_at: string;
  created_by: string | null;
  notes: string | null;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  property_interest?: string;
  notes?: string;
}
