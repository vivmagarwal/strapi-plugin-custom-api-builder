"use strict";

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
