import axios from 'axios';
import { clearToken, getToken } from './auth';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Si el token venció o es inválido, volvemos a pedir la clave en vez de mostrar
// pantallas rotas con datos a medias.
api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error?.response?.status === 401) {
      clearToken();
      window.location.reload();
    }
    return Promise.reject(error);
  },
);
