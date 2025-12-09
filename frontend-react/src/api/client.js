import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE = localStorage.getItem('api_url') || import.meta.env.VITE_API_URL || '/api';

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores
client.interceptors.response.use(
  (response) => response,
  (error) => {
    // Aviso amigable cuando expira la sesión (401)
    if (error.response?.status === 401) {
      try {
        toast.dismiss();
        toast.error('Tu sesión ha expirado. Redirigiendo al inicio de sesión…', { duration: 1500 });
      } catch {}
      localStorage.removeItem('token');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
      return Promise.reject(error);
    }

    // Aviso controlado cuando el backend está offline (sin response)
    if (!error.response) {
      if (typeof window !== 'undefined') {
        const key = '__last_network_toast__';
        const now = Date.now();
        const last = Number(sessionStorage.getItem(key) || 0);
        if (now - last > 10000) {
          try {
            toast.error('No se pudo conectar con el servidor. Verifica tu conexión o intenta más tarde.');
          } catch {}
          sessionStorage.setItem(key, String(now));
        }
      }
    }
    return Promise.reject(error);
  }
);

export default client;
