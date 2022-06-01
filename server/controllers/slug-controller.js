"use strict";

module.exports = {
  index(ctx) {
    ctx.body = strapi
      .plugin("custom-api")
      .service("slugService")
      .getWelcomeMessage();
  },
  async find(ctx) {
    try {
      return await strapi
        .plugin("custom-api")
        .service("findService")
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
};
