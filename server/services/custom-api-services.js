"use strict";

// retrieve a local service
const getService = (name) => {
  return strapi.plugin("content-manager").service(name);
};

module.exports = ({ strapi }) => ({
  async create(data) {
    return await strapi.entityService.create(
      "plugin::custom-api.custom-api",
      data
    );
  },

  async find(query) {
    return await strapi.entityService.findMany(
      "plugin::custom-api.custom-api",
      query
    );
  },
});
