/**
 * Convert relative image URLs to absolute URLs
 * @param images - Array of image URLs (can be relative or absolute)
 * @param baseUrl - Base URL of the server (e.g., http://localhost:5000)
 * @returns Array of absolute URLs
 */
export function toAbsoluteUrls(images: string[], baseUrl: string): string[] {
  return images.map((url) => {
    // If already absolute URL, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Convert relative URL to absolute
    const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
    return `${baseUrl}/api/${cleanUrl}`;
  });
}

/**
 * Get base URL from request or environment
 */
export function getBaseUrl(req?: any): string {
  if (process.env.BASE_URL) {
    return process.env.BASE_URL;
  }
  
  if (req) {
    return `${req.protocol}://${req.get('host')}`;
  }
  
  return 'http://localhost:5000';
}

/**
 * Generate a URL-friendly slug from a string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/([^0-9a-z-\s])/g, "")
    .replace(/(\s+)/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}
