import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export function useEntities(domain?: string | string[]) {
  const domainStr = Array.isArray(domain) ? domain.join(',') : domain;
  
  return useQuery({
    queryKey: ['entities', domainStr],
    queryFn: () => api.getEntities(domainStr),
    select: (data) => data.entities,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useNotifyServices() {
  return useQuery({
    queryKey: ['notify-services'],
    queryFn: () => api.getNotifyServices(),
    select: (data) => data.services,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
