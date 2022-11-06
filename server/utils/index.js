const cloneDeepWith = require("lodash/cloneDeepWith");

/**
 * Takes in the structure of custom api as stored in the database
 * trims the unselected fields and returns the trimmed version of structure
 */
function getTrimmedStructure(structure) {
  let trimmed = cloneDeepWith(structure, (value, key) => {
    if (key === "fields") {
      return value.filter((item) => {
        return item.selected;
      });
    }
  });

  return trimmed;
}

/**
 * Takes in a trimmed structure of the custom api as stored in the database
 * returns back a config object that can be used as it is by strapi.entityService.findMany
 */
function getConfigObject(trimmedStructure) {
  // helper function to recursively reduce the populate values.

  function populateReducer(value) {
    return value.reduce((acc, item) => {
      acc[item.table] = {};

      if (item.fields) {
        acc[item.table]["fields"] = item.fields.reduce((acc, item) => {
          acc.push(item.name);
          return acc;
        }, []);
      }

      if (item.populate) {
        acc[item.table]["populate"] = populateReducer(item.populate);
      }

      if (item.media) {
        item.media.forEach((m) => {
          acc[item.table]["populate"][m.name] = {};
        });
      }

      return acc;
    }, {});
  }

  let populatedFixed = cloneDeepWith(trimmedStructure, (value, key) => {
    if (key === "populate") {
      return populateReducer(value);
    }

    if (key === "fields") {
      return value.reduce((acc, item) => {
        acc.push(item.name);
        return acc;
      }, []);
    }
  });

  const selectedContentType = populatedFixed[0].selectedContentType.displayName;
  const config = populatedFixed[0].structure.populate[selectedContentType];

  return config;
}

module.exports = {
  getTrimmedStructure,
  getConfigObject,
};
