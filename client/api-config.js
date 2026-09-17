/**
 * Central API & Asset Configuration for Volga Infosys
 */
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Base API endpoint
window.VOLGA_API = isLocal
  ? 'http://localhost:5000/api'
  : `${window.location.origin}/api`;

// Image and uploads URL resolver
window.getVolgaImageUrl = function(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/uploads/')) {
    return isLocal
      ? `http://localhost:5000${url}`
      : `${window.location.origin}${url}`;
  }
  return url;
};

