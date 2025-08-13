import axios from 'axios';
import { IForm, IFormResponse } from '../types';

export const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';
export const API_ORIGIN = API_BASE_URL.replace(/\/?api\/?$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Form APIs
export const formApi = {
  create: async (formData: Partial<IForm>): Promise<IForm> => {
    const response = await api.post('/forms', formData);
    return response.data;
  },

  getAll: async (): Promise<IForm[]> => {
    const response = await api.get('/forms');
    return response.data;
  },

  getById: async (id: string): Promise<IForm> => {
    const response = await api.get(`/forms/${id}`);
    return response.data;
  },

  getByShareLink: async (shareLink: string): Promise<IForm> => {
    const response = await api.get(`/forms/share/${shareLink}`);
    return response.data;
  },

  update: async (id: string, formData: Partial<IForm>): Promise<IForm> => {
    const response = await api.put(`/forms/${id}`, formData);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/forms/${id}`);
  },

  publish: async (id: string): Promise<IForm> => {
    const response = await api.patch(`/forms/${id}/publish`);
    return response.data;
  },
};

// Response APIs
export const responseApi = {
  submit: async (formId: string, responseData: Partial<IFormResponse>): Promise<IFormResponse> => {
    const response = await api.post(`/responses/${formId}`, responseData);
    return response.data;
  },

  getByFormId: async (formId: string): Promise<IFormResponse[]> => {
    const response = await api.get(`/responses/${formId}`);
    return response.data;
  },

  getById: async (id: string): Promise<IFormResponse> => {
    const response = await api.get(`/responses/response/${id}`);
    return response.data;
  },
};

// File upload API
export const uploadApi = {
  uploadImage: async (file: File): Promise<{ filename: string; path: string }> => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await axios.post(`${API_ORIGIN}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default api; 