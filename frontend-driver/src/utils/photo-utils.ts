import api from '@/config/api';

/**
 * Compresse une image
 */
export async function compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Redimensionner si nécessaire
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}

/**
 * Convertit une dataURL en Blob
 */
export function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Upload une photo vers le serveur
 */
export async function uploadPhoto(file: File | Blob): Promise<string> {
  const formData = new FormData();
  formData.append('photo', file);

  const response = await api.post<{ photoUrl: string }>(
    '/driver/photos/single',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );

  if (!response.data.photoUrl) {
    throw new Error('Failed to upload photo');
  }

  return response.data.photoUrl;
}

/**
 * Redimensionne et compresse une image pour l'upload
 */
export async function prepareImageForUpload(file: File): Promise<Blob> {
  // Compresser l'image avant upload
  return await compressImage(file, 1200, 0.8);
}

/**
 * Valide qu'un fichier est une image
 */
export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return validTypes.includes(file.type);
}

/**
 * Valide la taille maximale d'un fichier (en MB)
 */
export function isValidFileSize(file: File, maxSizeMB = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}
