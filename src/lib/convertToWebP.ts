const WEBP_QUALITY = 0.85;

// MIME types eligible for WebP conversion
const CONVERTIBLE_TYPES = new Set(['image/jpeg', 'image/png']);

/**
 * Convert JPEG/PNG files to WebP using the Canvas API.
 * Skips SVG (vector), GIF (animation), and already-WebP files.
 * Returns original file if conversion fails or produces a larger result.
 */
export async function convertToWebP(file: File): Promise<File> {
  if (!CONVERTIBLE_TYPES.has(file.type)) {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);

    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;

    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();

    const blob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('WebP conversion failed'))),
        'image/webp',
        WEBP_QUALITY,
      );
    });

    // Keep original if WebP is somehow larger
    if (blob.size >= file.size) {
      return file;
    }

    const nameWithoutExt = file.name.replace(/\.[^.]+$/, '');
    return new File([blob], `${nameWithoutExt}.webp`, { type: 'image/webp' });
  } catch {
    // Conversion failed — return original file so upload still works
    return file;
  }
}
