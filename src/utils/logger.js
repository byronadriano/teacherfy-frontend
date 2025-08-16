// src/utils/logger.js
// Minimal logger that suppresses noisy logs in production
const isDev = process.env.NODE_ENV !== 'production';

export const log = (...args) => {
  if (isDev) console.log(...args);
};

export const warn = (...args) => {
  if (isDev) console.warn(...args);
};

export const error = (...args) => {
  // Keep errors visible in all environments
  console.error(...args);
};

const logger = { log, warn, error };

export default logger;
