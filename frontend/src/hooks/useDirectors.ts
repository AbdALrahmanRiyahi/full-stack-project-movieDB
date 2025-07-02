import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../utils/api';
import { Director } from '../types';

export const useDirectors = () => {
  return useQuery({
    queryKey: ['directors'],
    queryFn: async (): Promise<Director[]> => {
      const response = await api.get('/directors');
      return response.data;
    },
  });
};

export const useDirector = (id: string) => {
  return useQuery({
    queryKey: ['director', id],
    queryFn: async (): Promise<Director> => {
      const response = await api.get(`/directors/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateDirector = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (directorData: Omit<Director, '_id' | 'createdAt' | 'updatedAt'>): Promise<Director> => {
      const response = await api.post('/directors', directorData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['directors'] });
    },
  });
};

export const useUpdateDirector = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Director> }): Promise<Director> => {
      const response = await api.put(`/directors/${id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['directors'] });
      queryClient.invalidateQueries({ queryKey: ['director', data._id] });
    },
  });
};

export const useDeleteDirector = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/directors/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['directors'] });
    },
  });
};