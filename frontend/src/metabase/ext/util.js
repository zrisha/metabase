export function getSafe(fn, defaultVal = false) {
  try {
    return fn();
  } catch (e) {
    return defaultVal;
  }
}
