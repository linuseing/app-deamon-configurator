import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export function useBlueprints() {
  return useQuery({
    queryKey: ['blueprints'],
    queryFn: () => api.getBlueprints(),
    select: (data) => data.blueprints,
  });
}

export function useBlueprint(id: string | undefined) {
  return useQuery({
    queryKey: ['blueprint', id],
    queryFn: () => api.getBlueprint(id!),
    enabled: !!id,
  });
}
