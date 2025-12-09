import toast from 'react-hot-toast';

const QUEUE_KEY = 'offline_requests_queue';

/**
 * Servicio para manejar peticiones offline
 */
const offlineQueueService = {
  /**
   * Agrega una petición a la cola
   * @param {string} url - Endpoint URL
   * @param {string} method - HTTP Method (POST, PUT, DELETE)
   * @param {object} data - Datos de la petición
   */
  addToQueue: (url, method, data) => {
    const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    
    // Evitar duplicados exactos en corto tiempo
    const isDuplicate = queue.some(item => 
      item.url === url && 
      JSON.stringify(item.data) === JSON.stringify(data) &&
      (Date.now() - item.timestamp) < 5000 
    );

    if (isDuplicate) return;

    const requestItem = {
      id: Date.now(),
      url,
      method,
      data,
      timestamp: Date.now(),
      retries: 0
    };

    queue.push(requestItem);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    
    // Notificar al usuario
    toast('Guardado en modo offline. Se sincronizará al conectar.', {
      icon: '💾',
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    });
  },

  /**
   * Obtiene la cola actual
   */
  getQueue: () => {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  },

  /**
   * Elimina un item de la cola por ID
   */
  removeFromQueue: (id) => {
    const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    const newQueue = queue.filter(item => item.id !== id);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(newQueue));
  },

  /**
   * Limpia toda la cola
   */
  clearQueue: () => {
    localStorage.removeItem(QUEUE_KEY);
  },

  /**
   * Retorna cantidad de items pendientes
   */
  getPendingCount: () => {
    const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    return queue.length;
  }
};

export default offlineQueueService;
