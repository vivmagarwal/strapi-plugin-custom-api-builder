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

  async findById(id, query) {
    return await strapi.entityService.findOne(
      "plugin::custom-api.custom-api",
      id,
      query
    );
  },

  async findContentTypeBySlug(slug, query) {
    return await strapi.entityService.findMany(
      "plugin::custom-api.custom-api",
      {
        filters: { slug: slug },
      }
    );
  },

  async update(id, data) {
    return await strapi.entityService.update(
      "plugin::custom-api.custom-api",
      id,
      data
    );
  },
});
