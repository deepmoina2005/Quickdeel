const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const serverBase = apiBase.replace(/\/api\/?$/, '');
const mediaBase = import.meta.env.VITE_MEDIA_URL || '';
const imagePathPattern = /\.(avif|gif|jpe?g|png|webp|svg)$/i;

export const mediaUrl = (url, fallback = '') => {
  const value = String(url || '').trim();
  if (!value) return fallback;
  if (/^(https?:|data:|blob:)/i.test(value)) return value;
  if (value.startsWith('/uploads/')) return `${mediaBase}${value}`;
  if (value.startsWith('uploads/')) return `${mediaBase}/${value}`;
  if (imagePathPattern.test(value)) return `${mediaBase || serverBase}/uploads/${value.replace(/^\/+/, '')}`;
  return fallback;
};
