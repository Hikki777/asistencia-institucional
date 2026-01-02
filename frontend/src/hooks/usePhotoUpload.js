import { useState } from 'react';
import client from '../api/client';
import offlineQueueService from '../services/offlineQueue';
import toast from 'react-hot-toast';

/**
 * Hook personalizado para subir fotos con soporte offline
 * @param {string} personType - 'alumno' o 'personal'
 * @returns {Object} - { uploadPhoto, uploading, progress }
 */
export function usePhotoUpload(personType) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadPhoto = async (personId, file) => {
    setUploading(true);
    setProgress(0);

    try {
      // Verificar conexión
      const isOnline = navigator.onLine;

      if (isOnline) {
        // Modo online: subir directamente
        const formData = new FormData();
        formData.append('foto', file);

        const endpoint = personType === 'alumno' 
          ? `/alumnos/${personId}/foto`
          : `/docentes/${personId}/foto`;

        const response = await client.post(endpoint, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          }
        });

        toast.success('Foto subida exitosamente');
        setUploading(false);
        return response.data.url;
      } else {
        // Modo offline: guardar en cola
        const base64 = await offlineQueueService.addPhotoToQueue(
          personId,
          personType,
          file
        );

        setProgress(100);
        setUploading(false);
        return base64; // Retornar Base64 para preview
      }
    } catch (error) {
      console.error('Error subiendo foto:', error);
      toast.error('Error al subir la foto');
      setUploading(false);
      throw error;
    }
  };

  return { uploadPhoto, uploading, progress };
}

export default usePhotoUpload;
