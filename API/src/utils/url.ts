/**
 * Convert relative image URLs to absolute URLs
 * @param images - Array of image URLs (can be relative or absolute)
 * @param baseUrl - Base URL of the server (e.g., http://localhost:5000)
 * @returns Array of absolute URLs
 */
export function toAbsoluteUrls(images: string[], baseUrl: string): string[] {
  return images.map((url) => {
    // If URL contains localhost, replace it with the current baseUrl
    if (url.includes('localhost')) {
      return url.replace(/http:\/\/localhost:\d+/, baseUrl);
    }

    // If already absolute URL (and not localhost), return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // Convert relative URL to absolute
    const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
    const finalBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return `${finalBase}/api/${cleanUrl}`;
  });
}

/**
 * Convert absolute URLs back to relative paths for storage
 */
export function toRelativePaths(images: any[]): string[] {
  return images.map((img) => {
    // If it's an object from the new upload API { path, url }, take the path
    if (img && typeof img === 'object' && img.path) {
      return img.path;
    }

    const url = String(img);
    // If it contains /api/uploads/, extract just uploads/...
    const match = url.match(/\/api\/(uploads\/.+)$/);
    if (match) return match[1];
    
    // If it's a full localhost/ngrok URL but not matched above, try a simpler split
    if (url.includes('/uploads/')) {
      return 'uploads/' + url.split('/uploads/')[1];
    }

    return url;
  });
}

/**
 * Get base URL from request or environment
 */
export function getBaseUrl(req?: any): string {
  // 1. If request is provided, try to detect public URL from headers
  if (req) {
    const host = req.get('host');
    const protocol = req.protocol;

    // If accessed via localhost but we have a BASE_URL in env that is public, use it
    if (host.includes('localhost') && process.env.BASE_URL && !process.env.BASE_URL.includes('localhost')) {
      return process.env.BASE_URL;
    }

    return `${protocol}://${host}`;
  }

  // 2. Fallback to environment variable
  if (process.env.BASE_URL) {
    return process.env.BASE_URL;
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
