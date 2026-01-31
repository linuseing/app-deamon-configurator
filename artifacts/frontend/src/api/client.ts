const API_BASE = '/api';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new ApiError(response.status, error.error || 'API request failed');
  }

  return response.json();
}

// Typed API functions
export const api = {
  // Blueprints
  getBlueprints: () => 
    apiFetch<{ blueprints: import('../types').BlueprintSummary[] }>('/blueprints'),
  
  getBlueprint: (id: string) =>
    apiFetch<{ blueprint: import('../types').Blueprint; blueprintId: string }>(`/blueprints/${id}`),

  // Instances
  getInstances: () =>
    apiFetch<{ 
      instances: import('../types').AppInstanceSummary[]; 
      needsSettings: boolean; 
      categories: string[] 
    }>('/instances'),

  getInstance: (id: string) =>
    apiFetch<{
      instance: import('../types').AppInstance;
      blueprint: import('../types').Blueprint | null;
      categories: string[];
    }>(`/instances/${id}`),

  createInstance: (data: {
    blueprintId: string;
    config: Record<string, unknown>;
    instanceName?: string;
    category?: string;
    tags?: string[];
  }) =>
    apiFetch<{ success: boolean; instance: import('../types').AppInstance; message: string }>(
      '/instances',
      { method: 'POST', body: JSON.stringify(data) }
    ),

  updateInstance: (id: string, data: {
    config: Record<string, unknown>;
    newInstanceId?: string;
    category?: string;
    tags?: string[];
  }) =>
    apiFetch<{ success: boolean; instance: import('../types').AppInstance }>(
      `/instances/${id}`,
      { method: 'PUT', body: JSON.stringify(data) }
    ),

  deleteInstance: (id: string) =>
    apiFetch<{ success: boolean }>(`/instances/${id}`, { method: 'DELETE' }),

  // Entities
  getEntities: (domain?: string) => {
    const params = domain ? `?domain=${domain}` : '';
    return apiFetch<{ entities: { value: string; label: string; domain: string }[] }>(
      `/entities${params}`
    );
  },

  // Notification Services
  getNotifyServices: () =>
    apiFetch<{ services: { value: string; label: string }[] }>('/notify-services'),

  // Settings
  getSettings: () =>
    apiFetch<{ settings: import('../types').AppSettings | undefined; addonMode: boolean }>('/settings'),

  saveSettings: (settings: Partial<import('../types').AppSettings>) =>
    apiFetch<{ success: boolean; settings: import('../types').AppSettings }>(
      '/settings',
      { method: 'POST', body: JSON.stringify(settings) }
    ),

  // Upload
  uploadBlueprints: async (file: File) => {
    const response = await fetch(`${API_BASE}/upload-blueprints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/zip',
      },
      body: await file.arrayBuffer(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new ApiError(response.status, error.error || 'Upload failed');
    }

    return response.json() as Promise<{ success: boolean; message: string }>;
  },
};
