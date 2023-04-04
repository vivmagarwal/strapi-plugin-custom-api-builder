const cloneDeepWith = require("lodash/cloneDeepWith");

/**
 * Filters out unselected fields from the given structure.
 * @param {Object} structure - The original structure.
 * @returns {Object} - The trimmed structure with only selected fields.
 */
function getTrimmedStructure(structure) {
  return cloneDeepWith(structure, (value, key) => {
    if (key === "fields") {
      return value.filter(item => item.selected);
    }
  });
}

/**
 * Recursively reduces the populate values of the given value array.
 * @param {Array} value - The value array to reduce.
 * @returns {Object} - The reduced object.
 */
function populateReducer(value) {
  const reducedObject = {};

  for (const item of value) {
    reducedObject[item.table] = {};

    if (item.fields) {
      reducedObject[item.table].fields = item.fields.map(field => field.name);
    }

    if (item.populate) {
      reducedObject[item.table].populate = populateReducer(item.populate);
    }

    if (item.media) {
      for (const media of item.media) {
        if (!reducedObject[item.table].populate) {
          reducedObject[item.table].populate = {};
        }
        reducedObject[item.table].populate[media.name] = {};
      }
    }
  }

  return reducedObject;
}

/**
 * Creates a configuration object from the given trimmed structure.
 * @param {Object} trimmedStructure - The trimmed structure.
 * @returns {Object} - The configuration object.
 */
function getConfigObject(trimmedStructure) {
  const populatedFixed = cloneDeepWith(trimmedStructure, (value, key) => {
    if (key === "populate") {
      return populateReducer(value);
    }

    if (key === "fields") {
      return value.map(item => item.name);
    }
  });

  const selectedContentType = trimmedStructure[0].selectedContentType.displayName;
  const config = populatedFixed[0].structure.populate[selectedContentType];

  return config;
}

module.exports = {
  getTrimmedStructure,
  getConfigObject,
};
