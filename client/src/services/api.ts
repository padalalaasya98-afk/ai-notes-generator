import { NoteRecord, User, DashboardStats, SourceRecord } from '../types';

const API_BASE = 'http://localhost:5000/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    ...getAuthHeader(),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  auth: {
    async register(data: { name: string; email: string; password: string }) {
      return request<{ success: boolean; token: string; user: User }>('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    },

    async login(data: { email: string; password: string }) {
      return request<{ success: boolean; token: string; user: User }>('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    },

    async logout() {
      return request<{ success: boolean }>('/auth/logout', { method: 'POST' });
    },

    async getMe() {
      return request<{ success: boolean; user: User }>('/auth/me');
    }
  },

  // Notes
  notes: {
    async generate(data: {
      sourceType: string;
      content: string;
      subject?: string;
      topic?: string;
      course?: string;
      category?: string;
      educationLevel?: string;
      noteLength?: string;
      outputStyle?: string;
      sourceMaterialId?: string | null;
    }) {
      return request<{ success: boolean; note: NoteRecord }>('/notes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    },

    async getAll(params: { search?: string; category?: string; sort?: string } = {}) {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.set('search', params.search);
      if (params.category && params.category !== 'All') queryParams.set('category', params.category);
      if (params.sort) queryParams.set('sort', params.sort);

      const qs = queryParams.toString();
      return request<{ success: boolean; notes: NoteRecord[] }>(`/notes${qs ? `?${qs}` : ''}`);
    },

    async getById(id: string) {
      return request<{ success: boolean; note: NoteRecord }>(`/notes/${id}`);
    },

    async update(id: string, updates: Partial<NoteRecord>) {
      return request<{ success: boolean; note: NoteRecord }>(`/notes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    },

    async delete(id: string) {
      return request<{ success: boolean; message: string }>(`/notes/${id}`, {
        method: 'DELETE'
      });
    },

    async getStats() {
      return request<{ success: boolean; stats: DashboardStats }>('/notes/stats');
    }
  },

  // Sources
  sources: {
    async createText(type: 'text' | 'transcript', content: string, filename?: string) {
      return request<{ success: boolean; source: SourceRecord }>('/sources/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, content, filename })
      });
    },

    async uploadPdf(file: File) {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE}/sources/pdf`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: formData
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload and extract PDF.');
      }
      return data as { success: boolean; source: SourceRecord };
    },

    async uploadAudio(file: File) {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE}/sources/audio`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: formData
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload and transcribe audio.');
      }
      return data as { success: boolean; source: SourceRecord };
    },

    async getAll() {
      return request<{ success: boolean; sources: SourceRecord[] }>('/sources');
    },

    async delete(id: string) {
      return request<{ success: boolean; message: string }>(`/sources/${id}`, {
        method: 'DELETE'
      });
    }
  }
};
