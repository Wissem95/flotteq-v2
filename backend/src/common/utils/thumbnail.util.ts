import * as sharp from 'sharp';
import { Logger } from '@nestjs/common';

const logger = new Logger('ThumbnailUtil');

/**
 * Génère un thumbnail à partir d'une image
 * @param originalPath Chemin de l'image originale
 * @param width Largeur du thumbnail (défaut: 400px)
 * @param height Hauteur du thumbnail (défaut: 300px)
 * @param quality Qualité JPEG (défaut: 80)
 * @returns Chemin du thumbnail généré
 */
export async function generateThumbnail(
  originalPath: string,
  width: number = 400,
  height: number = 300,
  quality: number = 80,
): Promise<string> {
  try {
    // Générer le nom du thumbnail (_thumb avant l'extension)
    const thumbnailPath = originalPath.replace(/(\.[^.]+)$/, '_thumb$1');

    await sharp(originalPath)
      .resize(width, height, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality })
      .toFile(thumbnailPath);

    logger.log(`Thumbnail generated: ${thumbnailPath}`);
    return thumbnailPath;
  } catch (error) {
    logger.error(`Failed to generate thumbnail for ${originalPath}`, error);
    throw error;
  }
}

/**
 * Génère des thumbnails pour plusieurs images
 */
export async function generateThumbnails(
  imagePaths: string[],
  options?: {
    width?: number;
    height?: number;
    quality?: number;
  },
): Promise<string[]> {
  const thumbnails: string[] = [];

  for (const imagePath of imagePaths) {
    try {
      const thumbnail = await generateThumbnail(
        imagePath,
        options?.width,
        options?.height,
        options?.quality,
      );
      thumbnails.push(thumbnail);
    } catch (error) {
      logger.warn(`Skipping thumbnail generation for ${imagePath}`);
      thumbnails.push(''); // Placeholder vide si la génération échoue
    }
  }

  return thumbnails;
}
