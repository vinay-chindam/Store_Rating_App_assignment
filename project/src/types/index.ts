export interface User {
  id: string;
  name: string;
  email: string;
  address: string;
  role: 'admin' | 'user' | 'store_owner';
  created_at: string;
  updated_at: string;
}

export interface Store {
  id: string;
  name: string;
  email: string;
  address: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  average_rating?: number;
  user_rating?: number;
}

export interface Rating {
  id: string;
  user_id: string;
  store_id: string;
  rating: number;
  created_at: string;
  updated_at: string;
  user?: User;
  store?: Store;
}

export interface DashboardStats {
  total_users: number;
  total_stores: number;
  total_ratings: number;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (userData: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
}

export interface SignUpData {
  name: string;
  email: string;
  address: string;
  password: string;
}

export interface StoreWithRating extends Store {
  average_rating: number;
  user_rating?: number;
}