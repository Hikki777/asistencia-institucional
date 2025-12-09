// Validación y compresión de imágenes
export const validateImageDimensions = async (file) => {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      const width = img.width;
      const height = img.height;
      
      resolve({
        width,
        height,
        isValid: width >= 200 && height >= 200 && width <= 2000 && height <= 2000,
        isSquare: Math.abs(width - height) < 50,
        message: width < 200 || height < 200 
          ? 'La imagen es muy pequeña (mínimo 200x200px)'
          : width > 2000 || height > 2000
          ? 'La imagen es muy grande (máximo 2000x2000px)'
          : 'Dimensiones válidas'
      });
    };
    
    img.src = url;
  });
};

export const getImageSize = (base64) => {
  const sizeInBytes = (base64.length * 3) / 4;
  const sizeInKB = sizeInBytes / 1024;
  const sizeInMB = sizeInKB / 1024;
  
  return {
    bytes: sizeInBytes,
    kb: sizeInKB,
    mb: sizeInMB,
    formatted: sizeInMB > 1 
      ? `${sizeInMB.toFixed(2)} MB` 
      : `${sizeInKB.toFixed(2)} KB`
  };
};

export const compressImage = async (base64, maxSizeKB = 1024) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Calcular nueva dimensión si es necesario
      const maxDimension = 1000;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = (height / width) * maxDimension;
          width = maxDimension;
        } else {
          width = (width / height) * maxDimension;
          height = maxDimension;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      // Comprimir con calidad variable
      let quality = 0.9;
      let compressed = canvas.toDataURL('image/jpeg', quality);
      
      while (getImageSize(compressed).kb > maxSizeKB && quality > 0.1) {
        quality -= 0.1;
        compressed = canvas.toDataURL('image/jpeg', quality);
      }
      
      resolve(compressed);
    };
    img.src = base64;
  });
};

// Nueva función para crear thumbnail pequeño para localStorage
export const createThumbnail = async (base64, maxSize = 200) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ratio = Math.min(maxSize / img.width, maxSize / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Comprimir agresivamente para localStorage
      resolve(canvas.toDataURL('image/jpeg', 0.6));
    };
    img.src = base64;
  });
};
