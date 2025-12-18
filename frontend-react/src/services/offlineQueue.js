import toast from 'react-hot-toast';
import indexedDBService from './indexedDBService';

/**
 * Servicio para manejar peticiones offline con IndexedDB
 * Incluye retry logic y compresión de imágenes
 */
const offlineQueueService = {
  /**
   * Agrega una petición a la cola
   */
  addToQueue: async (url, method, data) => {
    try {
      await indexedDBService.addRequest(url, method, data);
      
      toast('Guardado en modo offline. Se sincronizará al conectar.', {
        icon: '💾',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
    } catch (error) {
      console.error('Error adding to queue:', error);
      toast.error('Error al guardar offline');
    }
  },

  /**
   * Agrega una foto a la cola de sincronización
   * Comprime la imagen antes de guardar
   */
  addPhotoToQueue: async (personId, personType, file) => {
    try {
      // Comprimir imagen antes de convertir a Base64
      const compressedFile = await compressImage(file, 0.7); // 70% quality
      const base64 = await fileToBase64(compressedFile);
      
      await indexedDBService.addPhoto(
        personId,
        personType,
        base64,
        file.name,
        file.type
      );
      
      toast('Foto guardada offline. Se subirá al conectar.', {
        icon: '📸',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });

      return base64;
    } catch (error) {
      console.error('Error guardando foto offline:', error);
      toast.error('Error al guardar foto offline');
      return null;
    }
  },

  /**
   * Obtiene la cola actual de peticiones
   */
  getQueue: async () => {
    return await indexedDBService.getRequests();
  },

  /**
   * Obtiene la cola de fotos pendientes
   */
  getPhotosQueue: async () => {
    return await indexedDBService.getPhotos();
  },

  /**
   * Elimina un item de la cola por ID
   */
  removeFromQueue: async (id) => {
    await indexedDBService.deleteRequest(id);
  },

  /**
   * Elimina una foto de la cola por ID
   */
  removePhotoFromQueue: async (id) => {
    await indexedDBService.deletePhoto(id);
  },

  /**
   * Actualiza el estado de una petición
   */
  updateRequestStatus: async (id, status, retries = 0) => {
    await indexedDBService.updateRequestStatus(id, status, retries);
  },

  /**
   * Actualiza el estado de una foto
   */
  updatePhotoStatus: async (id, status, retries = 0) => {
    await indexedDBService.updatePhotoStatus(id, status, retries);
  },

  /**
   * Limpia toda la cola de peticiones
   */
  clearQueue: async () => {
    await indexedDBService.clearRequests();
  },

  /**
   * Limpia toda la cola de fotos
   */
  clearPhotosQueue: async () => {
    await indexedDBService.clearPhotos();
  },

  /**
   * Retorna cantidad total de items pendientes
   */
  getPendingCount: async () => {
    return await indexedDBService.getPendingCount();
  },

  /**
   * Migra datos de localStorage a IndexedDB (una sola vez)
   */
  migrateFromLocalStorage: async () => {
    try {
      // Migrar peticiones
      const oldQueue = JSON.parse(localStorage.getItem('offline_requests_queue') || '[]');
      for (const item of oldQueue) {
        await indexedDBService.addRequest(item.url, item.method, item.data);
      }

      // Migrar fotos
      const oldPhotos = JSON.parse(localStorage.getItem('offline_photos_queue') || '[]');
      for (const photo of oldPhotos) {
        await indexedDBService.addPhoto(
          photo.personId,
          photo.personType,
          photo.base64,
          photo.fileName,
          photo.fileType
        );
      }

      // Limpiar localStorage después de migrar
      localStorage.removeItem('offline_requests_queue');
      localStorage.removeItem('offline_photos_queue');
      localStorage.setItem('migrated_to_indexeddb', 'true');

      console.log('✅ Migración a IndexedDB completada');
    } catch (error) {
      console.error('Error migrando a IndexedDB:', error);
    }
  }
};

/**
 * Convierte un File a Base64
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

/**
 * Comprime una imagen usando Canvas
 * @param {File} file - Archivo de imagen
 * @param {number} quality - Calidad de compresión (0-1)
 * @returns {Promise<Blob>} - Imagen comprimida
 */
function compressImage(file, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Redimensionar si es muy grande
        let width = img.width;
        let height = img.height;
        const maxSize = 1200;

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height / width) * maxSize;
            width = maxSize;
          } else {
            width = (width / height) * maxSize;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: 'image/webp' }));
            } else {
              reject(new Error('Error comprimiendo imagen'));
            }
          },
          'image/webp',
          quality
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}

// Migrar automáticamente al cargar
if (typeof window !== 'undefined' && !localStorage.getItem('migrated_to_indexeddb')) {
  offlineQueueService.migrateFromLocalStorage();
}

export default offlineQueueService;
