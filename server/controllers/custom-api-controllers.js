"use strict";

const { contentTypes: contentTypesUtils } = require("@strapi/utils");
const { has, assoc, mapValues, prop } = require("lodash/fp");

const hasEditMainField = has("edit.mainField");
const getEditMainField = prop("edit.mainField");
const assocListMainField = assoc("list.mainField");

const assocMainField = (metadata) =>
  hasEditMainField(metadata)
    ? assocListMainField(getEditMainField(metadata), metadata)
    : metadata;

// retrieve a local service
const getService = (name) => {
  return strapi.plugin("content-manager").service(name);
};

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

  async findById(ctx) {
    const { id } = ctx.params;
    try {
      return await strapi
        .plugin("custom-api")
        .service("customApiServices")
        .findById(id, ctx.query);
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  async findBySlug(ctx) {
    const { id, slug } = ctx.params;
    const { query } = ctx;

    console.log(ctx.params);
    console.log(ctx.query);

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

  async update(ctx) {
    try {
      ctx.body = await strapi
        .plugin("custom-api")
        .service("customApiServices")
        .update(ctx.params.id, ctx.request.body);
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  async findContentTypes(ctx) {
    // const { kind } = ctx.query;

    const contentTypes =
      getService("content-types").findContentTypesByKind("collectionType");
    const { toDto } = getService("data-mapper");
    const contentTypesMappedToDto = contentTypes.map(toDto);
    const filteredContentTypes = contentTypesMappedToDto.filter(
      (item) =>
        item.isDisplayed && item.apiID !== "user" && item.apiID !== "custom-api"
    );

    return filteredContentTypes;
  },

  async findContentTypesSettings(ctx) {
    const { findAllContentTypes, findConfiguration } =
      getService("content-types");

    const contentTypes = await findAllContentTypes();
    const configurations = await Promise.all(
      contentTypes.map(async (contentType) => {
        const { uid, settings } = await findConfiguration(contentType);
        return { uid, settings };
      })
    );

    return configurations;
  },

  async findContentTypeConfiguration(ctx) {
    const { uid } = ctx.params;

    const contentTypeService = getService("content-types");

    const contentType = await contentTypeService.findContentType(uid);

    if (!contentType) {
      return ctx.notFound("contentType.notFound");
    }

    const configuration = await contentTypeService.findConfiguration(
      contentType
    );

    const confWithUpdatedMetadata = {
      ...configuration,
      metadatas: mapValues(assocMainField, configuration.metadatas),
    };

    const components = await contentTypeService.findComponentsConfigurations(
      contentType
    );

    return {
      data: {
        contentType: confWithUpdatedMetadata,
        components,
      },
    };
  },

  async authorReport() {
    const config = {};

    config["fields"] = null;
    config["fields"] = [];
    config["fields"].push("AuthorName");
    config["fields"].push("AuthorAge");
    config["populate"] = {};

    config["populate"]["books"] = {};
    config["populate"]["books"]["fields"] = null;
    config["populate"]["books"]["fields"] = [];
    config["populate"]["books"]["fields"].push("BookTitle");

    config["populate"]["books"]["populate"] = {};
    config["populate"]["books"]["populate"]["publishers"] = {};
    config["populate"]["books"]["populate"]["publishers"]["fields"] = null;
    config["populate"]["books"]["populate"]["publishers"]["fields"] = [];
    config["populate"]["books"]["populate"]["publishers"]["fields"].push(
      "PublisherName"
    );

    const entries = await strapi.entityService.findMany(
      "api::author.author",
      config
    );

    // const entries = await strapi.entityService.findMany("api::author.author", {
    //   fields: ["AuthorName", "AuthorAge"],
    //   populate: {
    //     books: {
    //       fields: ["BookTitle"],
    //       populate: {
    //         publishers: {
    //           fields: ["PublisherName"],
    //         },
    //       },
    //     },
    //   },
    // });

    return entries;
  },
};
