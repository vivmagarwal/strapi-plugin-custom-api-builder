"use strict";

const { contentTypes: contentTypesUtils } = require("@strapi/utils");
const { has, assoc, mapValues, prop } = require("lodash/fp");
const cloneDeepWith = require("lodash/cloneDeepWith");

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

// @todo: refactoring - move all complex logic to services
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

  async findCustomApiStructureBySlug(ctx) {
    const { slug } = ctx.params;

    if (!slug) ctx.throw(500, new Error("Slug Not found"));

    try {
      return await strapi
        .plugin("custom-api")
        .service("customApiServices")
        .findContentTypeBySlug(slug, ctx.query);
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  async findCustomAPIDataBySlug(ctx) {
    const structure = await this.findCustomApiStructureBySlug(ctx);

    if (!structure || !structure.length) {
      ctx.throw(
        500,
        new Error("The structure for this custom-api route is not found.")
      );
    }

    const objHashmap = {};
    const iterate = (obj, i = 0) => {
      Object.keys(obj).forEach((key) => {
        if (key === "populate") {
          objHashmap[i] = obj[key];
          console.log(i, `key: ${key}, value: ${obj[key]}`);
        }
        if (
          typeof obj[key] === "object" &&
          obj[key] !== null &&
          !Array.isArray(obj[key]) &&
          key === "populate"
        ) {
          iterate(obj[key], ++i);
        }
      });
    };

    iterate(structure[0]["structure"]);

    const config = {};
    for (const index in objHashmap) {
      const key = +index;

      if (key === 0) {
        config["fields"] = objHashmap[index]["fields"]
          .filter((item) => item.selected)
          .map((item) => item.name);
      }

      if (key === 1) {
        const loc = config;

        loc["populate"] = {};
        loc["populate"][objHashmap[1]["table"]] = {
          fields: objHashmap[1]["fields"]
            .filter((item) => item.selected)
            .map((item) => item.name),
        };
      }

      if (key > 1) {
        let loc = config;
        for (let i = 1; i < key; i++) {
          loc = loc["populate"][objHashmap[i]["table"]];
        }

        loc["populate"] = {};

        loc["populate"][objHashmap[key]["table"]] = {
          fields: objHashmap[key]["fields"]
            .filter((item) => item.selected)
            .map((item) => item.name),
        };
      }
    }

    const entries = await strapi.entityService.findMany(
      structure[0]["selectedContentType"]["uid"],
      config
    );

    return entries;
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
};
