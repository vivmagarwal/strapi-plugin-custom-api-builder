const cloneDeepWith = require("lodash/cloneDeepWith");

// Filters out unselected fields from the given structure.
function getTrimmedStructure(structure) {
  const trimmed = cloneDeepWith(structure, (value, key) => {
    if (key === "fields" || key === "media" || key === "components" || key === "dynamiczones") {
      return value.filter(item => item.selected);
    }
  });
  console.log(`[getTrimmedStructure] Trimmed structure:`, JSON.stringify(trimmed, null, 2));
  return trimmed;
}

// Recursively reduces the populate values of the given value array.
function populateReducer(value) {
  const reducedObject = {};

  for (const item of value) {
    reducedObject[item.table] = {};

    if (item.fields) {

      // console.log(`[populateReducer] item.fields:`, JSON.stringify(item.fields, null, 2));
      reducedObject[item.table].fields = item.fields.map(field => field.name);
    }

    if (item.populate) {
      reducedObject[item.table].populate = populateReducer(item.populate);
      // console.log(`[populateReducer] item.populate:`, JSON.stringify(item.populate, null, 2));

    }

    if (item.media) {
      for (const media of item.media) {
        if (!reducedObject[item.table].populate) {
          reducedObject[item.table].populate = {};
        }
        reducedObject[item.table].populate[media.name] = {};
      }
    }

    if (item.components) {
      for (const component of item.components) {
        if (!reducedObject[item.table].populate) {
          reducedObject[item.table].populate = {};
        }
        reducedObject[item.table].populate[component.name] = {};
      }
    }

    if (item.dynamiczones) {
      for (const dz of item.dynamiczones) {
        if (!reducedObject[item.table].populate) {
          reducedObject[item.table].populate = {};
        }
        reducedObject[item.table].populate[dz.name] = {};
      }
    }
  }

  console.log(`[populateReducer] Reduced populate object:`, JSON.stringify(reducedObject, null, 2));
  return reducedObject;
}

// Creates a configuration object from the given trimmed structure.
function getConfigObject(trimmedStructure) {
  console.log(`[getConfigObject] Trimmed structure received:`, JSON.stringify(trimmedStructure, null, 2));

  const populatedFixed = cloneDeepWith(trimmedStructure, (value, key) => {
    if (key === "populate") {
      return populateReducer(value);
    }

    if (key === "fields") {
      return value.map(item => item.name);
    }
  });

  if (!populatedFixed || !populatedFixed[0] || !populatedFixed[0].structure) {
    console.error(`[getConfigObject] Invalid populatedFixed structure:`, populatedFixed);
    throw new Error('Invalid populatedFixed structure');
  }

  const selectedContentType = trimmedStructure[0].selectedContentType.displayName;
  const config = {
    fields: populatedFixed[0].structure.fields ? populatedFixed[0].structure.fields.map(field => field.name) : [],
    populate: populatedFixed[0].structure.populate ? populatedFixed[0].structure.populate[selectedContentType].populate : {}
  };

  console.log(`[getConfigObject] Final query config:`, JSON.stringify(config, null, 2));
  return config;
}

module.exports = {
  getTrimmedStructure,
  getConfigObject,
};
