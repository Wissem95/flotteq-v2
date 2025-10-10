import { memoryStorage } from 'multer';
import { BadRequestException } from '@nestjs/common';

export const multerConfig = {
  storage: memoryStorage(),
  fileFilter: (req: any, file: any, callback: any) => {
    // Accepter uniquement les images
    if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
      return callback(
        new BadRequestException(
          'Seuls les fichiers images (JPG, PNG, WEBP) sont acceptés',
        ),
        false,
      );
    }
    callback(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB par fichier
    files: 10, // Max 10 fichiers simultanés
  },
};
