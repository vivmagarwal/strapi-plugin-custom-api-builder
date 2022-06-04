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

    console.log("-------objHashmap start-------");
    console.log(objHashmap);
    console.log("-------objHashmap end-------");

    const config = {};
    for (const index in objHashmap) {
      const key = +index;
      const value = objHashmap[index];
      const table = value["table"];
      const fields = objHashmap[index]["fields"]
        .filter((item) => item.selected)
        .map((item) => item.name);

      console.log("-----------------");
      console.log(key);
      console.log("-----------------");
      console.log(table);
      console.log("-----------------");
      console.log(fields);
      console.log("-----------------");

      if (key === 0) {
        config["fields"] = fields;
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

    //   if (key === 2) {
    //     const loc = config
    //                    ["populate"][objHashmap[1]["table"]];

    //     loc["populate"] = {};

    //     loc["populate"][objHashmap[2]["table"]] = {
    //       fields: objHashmap[2]["fields"]
    //         .filter((item) => item.selected)
    //         .map((item) => item.name),
    //     };
    //   }

    //   if (key === 3) {
    //     const loc = config
    //                   ["populate"][objHashmap[1]["table"]]
    //                       ["populate"][objHashmap[2]["table"]];

    //     loc["populate"] = {};

    //     loc["populate"][objHashmap[3]["table"]] = {
    //       fields: objHashmap[3]["fields"]
    //         .filter((item) => item.selected)
    //         .map((item) => item.name),
    //     };
    //   }
    // }

    console.log("-------config starts----------");
    console.log(config);
    console.log("-------config ends----------");

    // if (value && value.table) {
    //   if (value.table === tableName) {
    //     const fields = [...value.fields];
    //     const toggledFields = fields.map((item) => {
    //       if (item.name === fieldName) {
    //         return { selected: !item.selected, name: item.name };
    //       } else {
    //         return item;
    //       }
    //     });
    //     return { ...value, fields: toggledFields };
    //   }
    // }
    // });

    /**
     * {
      fields: ["AuthorName", "AuthorAge"],
      populate: {
        books: {
          fields: ["BookTitle"],
          populate: {
            publishers: {
              fields: ["PublisherName"],
            },
          },
        },
      },
    }
     */

    const entries = await strapi.entityService.findMany(
      "api::author.author",
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
