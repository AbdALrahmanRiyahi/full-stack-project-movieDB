export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  token?: string;
}

export interface Director {
  _id: string;
  name: string;
  bio: string;
  birthDate: string;
  nationality: string;
  imageUrl?: string;
  userId: string | { _id: string; role?: 'user' | 'admin' };
  createdAt: string;
  updatedAt: string;
}

export interface Actor {
  _id: string;
  name: string;
  bio: string;
  birthDate: string;
  nationality: string;
  imageUrl?: string;
  userId: string | { _id: string; role?: 'user' | 'admin' };
  createdAt: string;
  updatedAt: string;
}

export interface Movie {
  _id: string;
  title: string;
  description: string;
  releaseDate: string;
  genre: string;
  duration: number;
  director: Director | string;
  actors: Actor[] | string[];
  imageUrl?: string;
  rating?: number;
  country?: string;
  teaserUrl?: string;
  userId: string | { _id: string; role?: 'user' | 'admin' };
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}