"use strict";

/**
 * Custom utility functions replacing lodash for the server (Node.js) side.
 * Zero dependencies - pure JavaScript implementations.
 *
 * Functions use lodash/fp-style curried API to match existing usage patterns:
 *   has(path)(obj)          - check if obj has nested path
 *   property(path)(obj)     - get nested value at path
 *   set(path)(value, obj)   - return new obj with path set to value
 *   mapValues(fn, obj)      - map over object values (iteratee-first)
 *   cloneDeepWith(val, fn)  - deep clone with customizer
 */

/**
 * Split a dot-delimited path string into an array of keys.
 * @param {string|string[]} path
 * @returns {string[]}
 */
function _toPath(path) {
  if (Array.isArray(path)) return path;
  if (typeof path !== 'string') return [];
  return path.split('.');
}

/**
 * Check if an object has a nested property path (curried / fp-style).
 * Usage: has("a.b.c")(obj) => boolean
 * @param {string} path
 * @returns {function(object): boolean}
 */
function has(path) {
  const keys = _toPath(path);
  return function (obj) {
    let current = obj;
    for (const key of keys) {
      if (current == null || !Object.prototype.hasOwnProperty.call(Object(current), key)) {
        return false;
      }
      current = current[key];
    }
    return true;
  };
}

/**
 * Get a nested property value (curried / fp-style).
 * Usage: prop("a.b")(obj) => value
 * @param {string} path
 * @returns {function(object): *}
 */
function prop(path) {
  const keys = _toPath(path);
  return function (obj) {
    let current = obj;
    for (const key of keys) {
      if (current == null) return undefined;
      current = current[key];
    }
    return current;
  };
}

/**
 * Set a nested property value, returning a new object (curried / fp-style).
 * Does NOT mutate the original.
 * Usage: assoc("a.b")(value, obj) => newObj
 * @param {string} path
 * @returns {function(*, object): object}
 */
function assoc(path) {
  const keys = _toPath(path);
  return function (value, obj) {
    const result = cloneDeep(obj);
    let current = result;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (current[key] == null || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    current[keys[keys.length - 1]] = value;
    return result;
  };
}

/**
 * Map over the values of an object (iteratee-first / fp-style).
 * Usage: mapValues(fn, obj) => newObj
 * @param {Function} iteratee - Called as fn(value, key, obj)
 * @param {object} obj
 * @returns {object}
 */
function mapValues(iteratee, obj) {
  const result = {};
  for (const key of Object.keys(obj)) {
    result[key] = iteratee(obj[key], key, obj);
  }
  return result;
}

/**
 * Deep clone a value.
 * @param {*} value
 * @returns {*}
 */
function cloneDeep(value) {
  return _cloneHelper(value, undefined, undefined, undefined, new Map());
}

/**
 * Deep clone with a customizer function.
 * If customizer returns non-undefined, that value is used.
 * Otherwise, default deep cloning is applied.
 * @param {*} value
 * @param {Function} customizer - Called as customizer(value, key, parent)
 * @returns {*}
 */
function cloneDeepWith(value, customizer) {
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

module.exports = {
  has,
  prop,
  assoc,
  mapValues,
  cloneDeep,
  cloneDeepWith,
};
