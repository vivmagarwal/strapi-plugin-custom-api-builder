"use strict";

// retrieve a local service
const getService = (name) => {
  return strapi.plugin("content-manager").service(name);
};

module.exports = ({ strapi }) => ({
  async create(data) {
    return await strapi.documents("plugin::custom-api.custom-api").create(data);
  },

  async find(query) {
    return await strapi.documents("plugin::custom-api.custom-api").findMany(query);
  },

  async findById(id, query) {
    return await strapi.documents("plugin::custom-api.custom-api").findOne({
      documentId: id,
      ...query
    });
  },

  async findContentTypeBySlug(slug, query) {
    return await strapi.documents("plugin::custom-api.custom-api").findMany({
      filters: { slug: slug },
      ...query
    });
  },

  async update(id, data) {
    return await strapi.documents("plugin::custom-api.custom-api").update({
      documentId: id,
      data
    });
  },

  async delete(id) {
    return await strapi.documents("plugin::custom-api.custom-api").delete({
      documentId: id,
    });
  },
});
