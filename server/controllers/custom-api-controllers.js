"use strict";

const { has, assoc, mapValues, prop, cloneDeepWith } = require("../../utils/helpers.js");
const { getConfigObject, getTrimmedStructure } = require("../utils");
const { parseFilters, validateFilters, buildFilterDocumentation } = require("../utils/filterUtils");
const { parseSort, validateSort, buildSortDocumentation } = require("../utils/sortUtils");
const { parsePagination, validatePagination, calculatePaginationMeta, buildPaginationDocumentation } = require("../utils/paginationUtils");

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
    const { slug } = ctx.params;

    if (!slug) {
      ctx.throw(400, "Slug is required");
      return;
    }

    try {
      const structure = await strapi
        .plugin("custom-api")
        .service("customApiServices")
        .findContentTypeBySlug(slug);

      console.log(`[findCustomAPIDataBySlug] Structure for slug ${slug}:`, JSON.stringify(structure, null, 2));

      if (!structure || !structure.length) {
        ctx.throw(404, "Structure not found for the given slug");
        return;
      }

      const trimmedStructure = getTrimmedStructure(structure);
      const config = getConfigObject(trimmedStructure);

      // Extract available fields for filtering validation
      const selectedContentType = structure[0].selectedContentType;
      const availableFields = trimmedStructure[0]?.structure?.fields || [];

      // Parse filters from query parameters
      const parsedFilters = parseFilters(ctx.query, availableFields);

      // Validate filters against available fields
      const filterValidation = validateFilters(parsedFilters, availableFields);
      if (!filterValidation.isValid) {
        console.warn(`[findCustomAPIDataBySlug] Filter validation warnings:`, filterValidation.errors);
        // Send warnings as response header but continue execution
        ctx.set('X-Filter-Warnings', JSON.stringify(filterValidation.errors));
      }

      // Add filters to query configuration
      if (Object.keys(parsedFilters).length > 0) {
        config.filters = parsedFilters;
        console.log(`[findCustomAPIDataBySlug] Applied filters:`, JSON.stringify(parsedFilters, null, 2));
      }

      // Parse sort from query parameters
      const parsedSort = parseSort(ctx.query, availableFields);

      // Validate sort against available fields
      const sortValidation = validateSort(parsedSort, availableFields);
      if (!sortValidation.isValid) {
        console.warn(`[findCustomAPIDataBySlug] Sort validation errors:`, sortValidation.errors);
        ctx.set('X-Sort-Errors', JSON.stringify(sortValidation.errors));
      }
      
      if (sortValidation.warnings.length > 0) {
        console.warn(`[findCustomAPIDataBySlug] Sort validation warnings:`, sortValidation.warnings);
        ctx.set('X-Sort-Warnings', JSON.stringify(sortValidation.warnings));
      }

      // Add sort to query configuration
      if (Array.isArray(parsedSort) && parsedSort.length > 0 && sortValidation.isValid) {
        config.sort = parsedSort;
        console.log(`[findCustomAPIDataBySlug] Applied sort:`, JSON.stringify(parsedSort, null, 2));
      }

      // Parse pagination from query parameters
      const paginationOptions = {
        defaultPageSize: 25,
        maxPageSize: 100,
        minPageSize: 1,
        allowUnpaginated: false
      };
      const parsedPagination = parsePagination(ctx.query, paginationOptions);

      // Validate pagination
      const paginationValidation = validatePagination(parsedPagination, paginationOptions);
      if (!paginationValidation.isValid) {
        console.warn(`[findCustomAPIDataBySlug] Pagination validation errors:`, paginationValidation.errors);
        ctx.set('X-Pagination-Errors', JSON.stringify(paginationValidation.errors));
      }
      
      if (paginationValidation.warnings.length > 0) {
        console.warn(`[findCustomAPIDataBySlug] Pagination validation warnings:`, paginationValidation.warnings);
        ctx.set('X-Pagination-Warnings', JSON.stringify(paginationValidation.warnings));
      }

      // Add pagination to query configuration
      if (paginationValidation.isValid) {
        config.pagination = parsedPagination;
        console.log(`[findCustomAPIDataBySlug] Applied pagination:`, JSON.stringify(parsedPagination, null, 2));
      } else {
        // Use default pagination if validation failed
        config.pagination = { page: 1, pageSize: 25 };
      }

      console.log(`[findCustomAPIDataBySlug] Final query config:`, JSON.stringify(config, null, 2));

      // Fetch paginated results with total count
      const [entries, count] = await Promise.all([
        strapi.documents(selectedContentType.uid).findMany(config),
        strapi.documents(selectedContentType.uid).count({ filters: config.filters })
      ]);

      // Calculate pagination metadata
      const paginationMeta = calculatePaginationMeta(config.pagination, count);

      console.log(`[findCustomAPIDataBySlug] Fetched ${entries?.length || 0} of ${count} total entries`);
      
      // Send response with data and metadata
      ctx.send({
        data: entries,
        meta: paginationMeta
      });
    } catch (error) {
      console.error(`[findCustomAPIDataBySlug] Error fetching data for slug ${slug}:`, error);
      ctx.throw(500, `Failed to fetch data for slug ${slug}: ${error.message}`);
    }
  },

  async validateSlug(ctx) {
    try {
      const { slug } = ctx.params;
      const { excludeId } = ctx.query;

      if (!slug) {
        ctx.throw(400, 'Slug parameter is required');
      }

      // Find existing APIs with this slug
      const existingAPIs = await strapi
        .plugin("custom-api")
        .service("customApiServices")
        .find({
          filters: { slug: slug },
        });

      // Filter out the current API if editing (excludeId provided)
      const conflictingAPIs = excludeId 
        ? existingAPIs.filter(api => api.id !== parseInt(excludeId))
        : existingAPIs;

      const isUnique = conflictingAPIs.length === 0;

      ctx.send({
        isUnique,
        slug,
        conflictingAPIs: conflictingAPIs.map(api => ({
          id: api.id,
          name: api.name,
          slug: api.slug
        }))
      });
    } catch (error) {
      console.error(`[validateSlug] Error validating slug:`, error);
      ctx.throw(500, `Failed to validate slug: ${error.message}`);
    }
  },

  async getFilterDocumentation(ctx) {
    const { slug } = ctx.params;

    if (!slug) {
      ctx.throw(400, "Slug is required");
      return;
    }

    try {
      const structure = await strapi
        .plugin("custom-api")
        .service("customApiServices")
        .findContentTypeBySlug(slug);

      if (!structure || !structure.length) {
        ctx.throw(404, "Structure not found for the given slug");
        return;
      }

      const trimmedStructure = getTrimmedStructure(structure);
      const availableFields = trimmedStructure[0]?.structure?.fields || [];

      // Build comprehensive filter, sort, and pagination documentation
      const filterDocs = buildFilterDocumentation(availableFields);
      const sortDocs = buildSortDocumentation(availableFields);
      const paginationDocs = buildPaginationDocumentation({
        defaultPageSize: 25,
        maxPageSize: 100,
        minPageSize: 1
      });

      ctx.send({
        slug,
        apiEndpoint: `/api/custom-api/${slug}`,
        filterDocumentation: filterDocs,
        sortDocumentation: sortDocs,
        paginationDocumentation: paginationDocs
      });
    } catch (error) {
      console.error(`[getFilterDocumentation] Error getting filter docs for slug ${slug}:`, error);
      ctx.throw(500, `Failed to get filter documentation for slug ${slug}: ${error.message}`);
    }
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

  // /custom-api/test-em-out-do-not-use
  // for testing purpose at the time of development only.
  async testEmOutDoNotUse(ctx) {
    let configAllAuthors = {
      fields: ["id", "AuthorName", "createdAt"],
      populate: {
        books: {
          fields: ["id", "BookName", "createdAt"],
        },
      },
    };

    let configAuthorsWithImage = {
      fields: ["id", "AuthorName"],
      populate: {
        AuthorImage: {},
      },
    };

    let configWithDynamicZones = {
        fields: ['id', 'book_name', 'createdAt', 'updatedAt'],
        populate: {
          book_image: {},
          authors: {
            fields: ['id', 'author_name', 'createdAt', 'updatedAt'],
          },
          Component_1: {
            populate: {
              another_media: {},
            },
          },
          dynamic_zone_1: {
            populate: {
              component_1: {
                fields: ['id', 'component_1', 'another_media'],
              },
            },
          },
        },
      };

let config = {
  "fields": [],
  "populate": {
    "authors": {
      "fields": [
        "id",
        "author_name",
        "createdAt"
      ]
    },
    "book_image": {}
  }
}

    try {
      // fetching data
      // const entries = await strapi.entityService.findMany(
      //   "api::author.author",
      //   {
      //     fields: ["id", "AuthorName"],
      //     populate: {
      //       hobbies: {
      //         fields: ["HobbyName"],
      //       },
      //       books: {
      //         fields: ["BookName"],
      //         populate: {
      //           book_categories: {
      //             fields: ["BookCategoryName"],
      //           },
      //         },
      //       },
      //     },
      //   }
      // );

      const entries = await strapi.documents('api::book.book').findMany(config);

      return entries;
    } catch (err) {
      return err;
    }
  },
};
