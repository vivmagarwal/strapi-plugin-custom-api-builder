"use strict";

module.exports = {
  async find(ctx) {
    try {
      return await strapi
        .plugin("custom-api")
        .service("customApiServices")
        .find(ctx.query);
    } catch (error) {
      ctx.throw(500, error);
    }
  },
  async findBySlug(ctx) {
    const { id, slug } = ctx.params;
    const { query } = ctx;

    // const entity = await strapi.service('api::restaurant.restaurant').findOne(id, query);
    // const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

    // return this.transformResponse(sanitizedEntity);
    return `${JSON.stringify(ctx.params.slug)}`;
  },
  async create(ctx) {
    try {
      ctx.body = await strapi
        .plugin("custom-api")
        .service("customApiServices")
        .create(ctx.request.body);
    } catch (error) {
      ctx.throw(500, error);
    }
  },
};
