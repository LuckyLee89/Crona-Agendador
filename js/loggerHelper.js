const isDev =
  window.location.hostname === 'localhost' ||
  window.location.hostname.includes('127.0.0.1');

export const log = (...args) => {
  if (isDev) console.log(...args);
};
export const warn = (...args) => {
  if (isDev) console.warn(...args);
};
export const error = (...args) => {
  if (isDev) console.error(...args);
};
