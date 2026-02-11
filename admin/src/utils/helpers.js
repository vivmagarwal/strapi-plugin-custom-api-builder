/**
 * Custom utility functions replacing lodash for the admin (browser) side.
 * Zero dependencies - pure JavaScript implementations.
 */

/**
 * Capitalize the first character of a string.
 * @param {string} str
 * @returns {string}
 */
export function upperFirst(str) {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert a string to kebab-case.
 * Handles camelCase, PascalCase, snake_case, spaces, and special characters.
 * @param {string} str
 * @returns {string}
 */
export function kebabCase(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

/**
 * Deep clone a value (objects, arrays, dates, regexps, primitives).
 * Handles circular references.
 * @param {*} value
 * @returns {*}
 */
export function cloneDeep(value) {
  return _cloneHelper(value, undefined, undefined, undefined, new Map());
}

/**
 * Deep clone with a customizer function.
 * If the customizer returns a non-undefined value, that value is used.
 * If it returns undefined, default deep cloning is applied.
 *
 * @param {*} value - The value to clone
 * @param {Function} customizer - Called as customizer(value, key, parent)
 * @returns {*}
 */
export function cloneDeepWith(value, customizer) {
  return _cloneHelper(value, undefined, undefined, customizer, new Map());
}

function _cloneHelper(value, key, parent, customizer, seen) {
  if (customizer) {
    const custom = customizer(value, key, parent);
    if (custom !== undefined) {
      return custom;
    }
  }

  if (value === null || typeof value !== 'object') {
    return value;
  }

  if (seen.has(value)) {
    return seen.get(value);
  }

  if (value instanceof Date) {
    return new Date(value.getTime());
  }

  if (value instanceof RegExp) {
    return new RegExp(value.source, value.flags);
  }

  if (Array.isArray(value)) {
    const arr = [];
    seen.set(value, arr);
    for (let i = 0; i < value.length; i++) {
      arr[i] = _cloneHelper(value[i], i, value, customizer, seen);
    }
    return arr;
  }

  const obj = {};
  seen.set(value, obj);
  for (const k of Object.keys(value)) {
    obj[k] = _cloneHelper(value[k], k, value, customizer, seen);
  }
  return obj;
}

/**
 * Debounce a function call.
 * @param {Function} fn
 * @param {number} delay - Milliseconds
 * @returns {Function}
 */
export function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
