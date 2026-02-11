/**
 * Lodash wrapper for Strapi Plugin Custom API Builder
 * This file provides all the lodash functions used by the plugin
 * as a local utility to eliminate external dependencies
 */

// Import the full lodash library (Node.js CommonJS require)
const _ = require('./lodash.js');

// Export all needed functions using CommonJS
module.exports = {
  // Individual function exports
  upperFirst: _.upperFirst,
  cloneDeepWith: _.cloneDeepWith,
  cloneDeep: _.cloneDeep,
  get: _.get,
  has: _.has,
  isEqual: _.isEqual,
  startsWith: _.startsWith,
  debounce: _.debounce,
  
  // Lodash/fp style functions
  assoc: _.set, // lodash/fp assoc is similar to lodash set
  mapValues: _.mapValues,
  prop: _.property, // lodash/fp prop is similar to lodash property
};