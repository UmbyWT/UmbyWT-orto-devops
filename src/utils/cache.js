const PREFIX = 'orto:';

// sessionStorage può non esserci o essere pieno: in quel caso si va
// semplicemente in rete
export function readCache(key) {
  try {
    const value = sessionStorage.getItem(PREFIX + key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export function writeCache(key, data) {
  try {
    sessionStorage.setItem(PREFIX + key, JSON.stringify(data));
  } catch {
    // cache piena: pazienza
  }
}
