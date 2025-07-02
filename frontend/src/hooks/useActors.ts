import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../utils/api';
import { Actor } from '../types';

export const useActors = () => {
  return useQuery({
    queryKey: ['actors'],
    queryFn: async (): Promise<Actor[]> => {
      const response = await api.get('/actors');
      return response.data;
    },
  });
};

export const useActor = (id: string) => {
  return useQuery({
    queryKey: ['actors', id],
    queryFn: async (): Promise<Actor> => {
      const response = await api.get(`/actors/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateActor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (actorData: Omit<Actor, '_id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
      const response = await api.post('/actors', actorData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actors'] });
    },
  });
};

export const useUpdateActor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Actor> }) => {
      const response = await api.put(`/actors/${id}`, data);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['actors'] });
      queryClient.invalidateQueries({ queryKey: ['actors', id] });
    },
  });
};

export const useDeleteActor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/actors/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actors'] });
    },
  });
}; 