import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../utils/api';
import { Movie } from '../types';

export const useMovies = () => {
  return useQuery({
    queryKey: ['movies'],
    queryFn: async (): Promise<Movie[]> => {
      const response = await api.get('/movies');
      return response.data;
    },
  });
};

export const useMovie = (id: string) => {
  return useQuery({
    queryKey: ['movie', id],
    queryFn: async (): Promise<Movie> => {
      const response = await api.get(`/movies/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateMovie = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (movieData: Omit<Movie, '_id' | 'createdAt' | 'updatedAt'>): Promise<Movie> => {
      const response = await api.post('/movies', movieData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
    },
  });
};

export const useUpdateMovie = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Movie> }): Promise<Movie> => {
      const response = await api.put(`/movies/${id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      queryClient.invalidateQueries({ queryKey: ['movie', data._id] });
    },
  });
};

export const useDeleteMovie = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/movies/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
    },
  });
};