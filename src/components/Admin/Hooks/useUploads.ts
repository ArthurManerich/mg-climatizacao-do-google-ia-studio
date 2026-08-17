import { useState } from 'react';
import { uploadService } from '../../../services/uploadService';

export interface UploadOptions {
  maxSizeMB?: number;
  allowedTypes?: string[];
}

const STRICT_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export function useUploads(options?: UploadOptions) {
  const maxSizeMB = options?.maxSizeMB ?? 5; // Default 5MB
  const allowedTypes = options?.allowedTypes ?? [...STRICT_IMAGE_MIME_TYPES];

  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    // Validate File Extension & Mime type
    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();
    const validExtension = /\.(jpg|jpeg|png|webp)$/i.test(fileName);
    const validMime = STRICT_IMAGE_MIME_TYPES.includes(fileType as typeof STRICT_IMAGE_MIME_TYPES[number])
      && allowedTypes.includes(fileType);

    if (!validExtension || !validMime) {
      return 'Formato de imagem inválido. Envie apenas arquivos JPG, PNG ou WebP.';
    }

    // Validate Max Size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `Tamanho da imagem excede o limite de ${maxSizeMB} MB. (Tamanho atual: ${(file.size / (1024 * 1024)).toFixed(1)} MB)`;
    }

    return null;
  };

  const uploadImage = async (
    file: File, 
    folder: 'portfolio' | 'before-after' | 'company-logo' = 'portfolio'
  ): Promise<string> => {
    setError(null);
    setProgress(0);

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      throw new Error(validationError);
    }

    try {
      setIsUploading(true);
      
      // Simulate progress updates for smooth feedback
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 15;
        });
      }, 100);

      const url = await uploadService.uploadImage(file, folder);

      clearInterval(progressInterval);
      setProgress(100);

      // Short delay before resetting progress bar state
      setTimeout(() => {
        setIsUploading(false);
        setProgress(0);
      }, 400);

      return url;
    } catch (err: any) {
      setIsUploading(false);
      setProgress(0);
      const friendlyMsg = err?.message || 'Erro ao fazer upload da imagem. Tente novamente.';
      setError(friendlyMsg);
      throw new Error(friendlyMsg);
    }
  };

  const clearError = () => setError(null);

  return {
    isUploading,
    progress,
    error,
    uploadImage,
    clearError,
    validateFile
  };
}
