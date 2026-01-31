import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

export function useInstances() {
  return useQuery({
    queryKey: ['instances'],
    queryFn: () => api.getInstances(),
  });
}

export function useInstance(id: string | undefined) {
  return useQuery({
    queryKey: ['instance', id],
    queryFn: () => api.getInstance(id!),
    enabled: !!id,
  });
}

export function useCreateInstance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createInstance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instances'] });
    },
  });
}

export function useUpdateInstance(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof api.updateInstance>[1]) =>
      api.updateInstance(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instances'] });
      queryClient.invalidateQueries({ queryKey: ['instance', id] });
    },
  });
}

export function useDeleteInstance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.deleteInstance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instances'] });
    },
  });
}
