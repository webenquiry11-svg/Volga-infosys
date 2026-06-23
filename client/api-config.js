/**
 * Central API configuration — change RAILWAY_URL here only.
 * 
 * HOW TO GET YOUR RAILWAY PUBLIC URL:
 *   Railway Dashboard → your backend service → Settings → Networking → Public Domain
 *   It looks like: https://volga-remodel-15-6-26-production.up.railway.app
 *
 * NOTE: volga-remodel-15-6-26.railway.internal is a PRIVATE url —
 *       it only works inside Railway. Browsers on Vercel CANNOT reach it.
 */
const RAILWAY_URL = 'https://volga-remodel-15-6-26-production.up.railway.app'; // ← paste your real public URL here

window.VOLGA_API = (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
)
  ? 'http://localhost:5000/api'
  : `${RAILWAY_URL}/api`;

window.getVolgaImageUrl = function(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/uploads/')) {
    return (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? `http://localhost:5000${url}`
      : `${RAILWAY_URL}${url}`;
  }
  return url;
};
