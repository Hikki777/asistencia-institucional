import { openDB } from 'idb';

const DB_NAME = 'HikariOpenDB';
const DB_VERSION = 1;
const PHOTOS_STORE = 'offline_photos';
const REQUESTS_STORE = 'offline_requests';

/**
 * Inicializa la base de datos IndexedDB
 */
async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Store para fotos
      if (!db.objectStoreNames.contains(PHOTOS_STORE)) {
        const photosStore = db.createObjectStore(PHOTOS_STORE, { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        photosStore.createIndex('personId', 'personId');
        photosStore.createIndex('personType', 'personType');
        photosStore.createIndex('timestamp', 'timestamp');
      }

      // Store para peticiones generales
      if (!db.objectStoreNames.contains(REQUESTS_STORE)) {
        const requestsStore = db.createObjectStore(REQUESTS_STORE, { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        requestsStore.createIndex('timestamp', 'timestamp');
      }
    },
  });
}

/**
 * Servicio de IndexedDB para almacenamiento offline
 */
const indexedDBService = {
  /**
   * Agrega una foto a la cola offline
   */
  async addPhoto(personId, personType, base64, fileName, fileType) {
    try {
      const db = await initDB();
      const photo = {
        personId,
        personType,
        base64,
        fileName,
        fileType,
        timestamp: Date.now(),
        retries: 0,
        status: 'pending' // pending, syncing, failed
      };

      const id = await db.add(PHOTOS_STORE, photo);
      return id;
    } catch (error) {
      console.error('Error adding photo to IndexedDB:', error);
      throw error;
    }
  },

  /**
   * Obtiene todas las fotos pendientes
   */
  async getPhotos() {
    try {
      const db = await initDB();
      return await db.getAllFromIndex(PHOTOS_STORE, 'timestamp');
    } catch (error) {
      console.error('Error getting photos from IndexedDB:', error);
      return [];
    }
  },

  /**
   * Obtiene fotos por persona
   */
  async getPhotosByPerson(personId, personType) {
    try {
      const db = await initDB();
      const allPhotos = await db.getAll(PHOTOS_STORE);
      return allPhotos.filter(
        p => p.personId === personId && p.personType === personType
      );
    } catch (error) {
      console.error('Error getting photos by person:', error);
      return [];
    }
  },

  /**
   * Actualiza el estado de una foto
   */
  async updatePhotoStatus(id, status, retries = 0) {
    try {
      const db = await initDB();
      const photo = await db.get(PHOTOS_STORE, id);
      if (photo) {
        photo.status = status;
        photo.retries = retries;
        await db.put(PHOTOS_STORE, photo);
      }
    } catch (error) {
      console.error('Error updating photo status:', error);
    }
  },

  /**
   * Elimina una foto de la cola
   */
  async deletePhoto(id) {
    try {
      const db = await initDB();
      await db.delete(PHOTOS_STORE, id);
    } catch (error) {
      console.error('Error deleting photo from IndexedDB:', error);
    }
  },

  /**
   * Agrega una petición a la cola
   */
  async addRequest(url, method, data) {
    try {
      const db = await initDB();
      const request = {
        url,
        method,
        data,
        timestamp: Date.now(),
        retries: 0,
        status: 'pending'
      };

      const id = await db.add(REQUESTS_STORE, request);
      return id;
    } catch (error) {
      console.error('Error adding request to IndexedDB:', error);
      throw error;
    }
  },

  /**
   * Obtiene todas las peticiones pendientes
   */
  async getRequests() {
    try {
      const db = await initDB();
      return await db.getAllFromIndex(REQUESTS_STORE, 'timestamp');
    } catch (error) {
      console.error('Error getting requests from IndexedDB:', error);
      return [];
    }
  },

  /**
   * Actualiza el estado de una petición
   */
  async updateRequestStatus(id, status, retries = 0) {
    try {
      const db = await initDB();
      const request = await db.get(REQUESTS_STORE, id);
      if (request) {
        request.status = status;
        request.retries = retries;
        await db.put(REQUESTS_STORE, request);
      }
    } catch (error) {
      console.error('Error updating request status:', error);
    }
  },

  /**
   * Elimina una petición de la cola
   */
  async deleteRequest(id) {
    try {
      const db = await initDB();
      await db.delete(REQUESTS_STORE, id);
    } catch (error) {
      console.error('Error deleting request from IndexedDB:', error);
    }
  },

  /**
   * Obtiene el conteo total de items pendientes
   */
  async getPendingCount() {
    try {
      const db = await initDB();
      const [photosCount, requestsCount] = await Promise.all([
        db.count(PHOTOS_STORE),
        db.count(REQUESTS_STORE)
      ]);
      return photosCount + requestsCount;
    } catch (error) {
      console.error('Error getting pending count:', error);
      return 0;
    }
  },

  /**
   * Limpia todas las fotos
   */
  async clearPhotos() {
    try {
      const db = await initDB();
      await db.clear(PHOTOS_STORE);
    } catch (error) {
      console.error('Error clearing photos:', error);
    }
  },

  /**
   * Limpia todas las peticiones
   */
  async clearRequests() {
    try {
      const db = await initDB();
      await db.clear(REQUESTS_STORE);
    } catch (error) {
      console.error('Error clearing requests:', error);
    }
  }
};

export default indexedDBService;
