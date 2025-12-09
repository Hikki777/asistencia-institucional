import axios from 'axios';
import toast from 'react-hot-toast';
import offlineQueueService from '../services/offlineQueue';

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

    // Aviso controlado cuando el backend está offline (sin response) o error de red
    if (!error.response || error.code === 'ERR_NETWORK') {
      const config = error.config;
      
      // Solo encolar métodos que modifican datos (POST, PUT, DELETE) y si no es un intento de auth
      if (['post', 'put', 'delete'].includes(config.method) && !config.url.includes('/auth')) {
        offlineQueueService.addToQueue(config.url, config.method, config.data);
        return Promise.resolve({ data: { success: true, offline: true, message: 'Guardado localmente' } });
      }

      if (typeof window !== 'undefined') {
        const key = '__last_network_toast__';
        const now = Date.now();
        const last = Number(sessionStorage.getItem(key) || 0);
        if (now - last > 10000) {
          try {
            toast.error('Modo Offline: Verificando conexión...', { id: 'offline-toast' });
          } catch {}
          sessionStorage.setItem(key, String(now));
        }
      }
    }
    return Promise.reject(error);
  }
);

export default client;
