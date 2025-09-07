/**
 * Response utilities for Custom API Builder
 * Provides intelligent response formatting based on field types and cardinality
 */

/**
 * Transform response data based on field metadata
 * @param {any} data - Raw response data from Strapi
 * @param {Object} metadata - Field metadata including cardinality
 * @param {Object} options - Transformation options
 * @returns {any} - Transformed response data
 */
function transformResponse(data, metadata = {}, options = {}) {
  const {
    flattenSingleRelations = true,
    includeMetadata = false,
    preserveNullValues = true
  } = options;

  if (!data) {
    return preserveNullValues ? null : undefined;
  }

  // Handle arrays of data
  if (Array.isArray(data)) {
    return data.map(item => transformSingleItem(item, metadata, options));
  }

  // Handle single item
  return transformSingleItem(data, metadata, options);
}

/**
 * Transform a single data item based on metadata
 * @param {Object} item - Single data item
 * @param {Object} metadata - Field metadata
 * @param {Object} options - Transformation options
 * @returns {Object} - Transformed item
 */
function transformSingleItem(item, metadata = {}, options = {}) {
  if (!item || typeof item !== 'object') {
    return item;
  }

  const transformed = {};
  const {
    flattenSingleRelations = true,
    includeMetadata = false,
    preserveNullValues = true
  } = options;

  Object.keys(item).forEach(key => {
    const value = item[key];
    const fieldMeta = metadata[key] || {};

    // Skip null values if not preserving them
    if (value === null && !preserveNullValues) {
      return;
    }

    // Handle relationships based on cardinality
    if (fieldMeta.type === 'relation') {
      transformed[key] = transformRelation(value, fieldMeta, options);
    }
    // Handle media fields
    else if (fieldMeta.type === 'media') {
      transformed[key] = transformMedia(value, fieldMeta, options);
    }
    // Handle component fields
    else if (fieldMeta.type === 'component') {
      transformed[key] = transformComponent(value, fieldMeta, options);
    }
    // Handle dynamic zones
    else if (fieldMeta.type === 'dynamiczone') {
      transformed[key] = transformDynamicZone(value, fieldMeta, options);
    }
    // Regular fields
    else {
      transformed[key] = value;
    }
  });

  // Add metadata if requested
  if (includeMetadata) {
    transformed.__metadata = metadata;
  }

  return transformed;
}

/**
 * Transform relation fields based on cardinality
 * @param {any} value - Relation value
 * @param {Object} fieldMeta - Field metadata
 * @param {Object} options - Transformation options
 * @returns {any} - Transformed relation
 */
function transformRelation(value, fieldMeta = {}, options = {}) {
  const { cardinality = 'many' } = fieldMeta;
  const { flattenSingleRelations = true } = options;

  // Handle null/undefined
  if (value === null || value === undefined) {
    return cardinality === 'one' ? null : [];
  }

  // Handle single relations
  if (cardinality === 'one' || cardinality === 'oneToOne' || cardinality === 'manyToOne') {
    // Flatten single relations if enabled and value is an array with one item
    if (flattenSingleRelations && Array.isArray(value) && value.length === 1) {
      return value[0];
    }
    // Return first item if array but expecting single
    if (Array.isArray(value) && value.length > 0) {
      return value[0];
    }
    return value;
  }

  // Handle many relations
  if (cardinality === 'many' || cardinality === 'oneToMany' || cardinality === 'manyToMany') {
    // Ensure array format for many relations
    if (!Array.isArray(value)) {
      return value ? [value] : [];
    }
    return value;
  }

  // Default behavior
  return value;
}

/**
 * Transform media fields based on cardinality
 * @param {any} value - Media value
 * @param {Object} fieldMeta - Field metadata
 * @param {Object} options - Transformation options
 * @returns {any} - Transformed media
 */
function transformMedia(value, fieldMeta = {}, options = {}) {
  const { multiple = false } = fieldMeta;
  const { flattenSingleRelations = true } = options;

  // Handle null/undefined
  if (value === null || value === undefined) {
    return multiple ? [] : null;
  }

  // Handle single media
  if (!multiple) {
    // Flatten if array with single item
    if (flattenSingleRelations && Array.isArray(value) && value.length === 1) {
      return extractMediaData(value[0]);
    }
    // Return first item if array but expecting single
    if (Array.isArray(value) && value.length > 0) {
      return extractMediaData(value[0]);
    }
    return extractMediaData(value);
  }

  // Handle multiple media
  if (!Array.isArray(value)) {
    return value ? [extractMediaData(value)] : [];
  }
  
  return value.map(extractMediaData);
}

/**
 * Extract relevant media data
 * @param {Object} media - Media object
 * @returns {Object} - Extracted media data
 */
function extractMediaData(media) {
  if (!media || typeof media !== 'object') {
    return media;
  }

  // Extract most relevant media fields
  const extracted = {
    id: media.id,
    url: media.url,
    name: media.name,
    alternativeText: media.alternativeText,
    caption: media.caption,
    width: media.width,
    height: media.height,
    formats: media.formats,
    mime: media.mime,
    size: media.size
  };

  // Remove undefined values
  Object.keys(extracted).forEach(key => {
    if (extracted[key] === undefined) {
      delete extracted[key];
    }
  });

  return extracted;
}

/**
 * Transform component fields
 * @param {any} value - Component value
 * @param {Object} fieldMeta - Field metadata
 * @param {Object} options - Transformation options
 * @returns {any} - Transformed component
 */
function transformComponent(value, fieldMeta = {}, options = {}) {
  const { repeatable = false } = fieldMeta;

  // Handle null/undefined
  if (value === null || value === undefined) {
    return repeatable ? [] : null;
  }

  // Handle repeatable components
  if (repeatable) {
    if (!Array.isArray(value)) {
      return value ? [value] : [];
    }
    return value;
  }

  // Handle single component
  if (Array.isArray(value) && value.length === 1) {
    return value[0];
  }
  
  return value;
}

/**
 * Transform dynamic zone fields
 * @param {any} value - Dynamic zone value
 * @param {Object} fieldMeta - Field metadata
 * @param {Object} options - Transformation options
 * @returns {any} - Transformed dynamic zone
 */
function transformDynamicZone(value, fieldMeta = {}, options = {}) {
  // Dynamic zones are always arrays
  if (value === null || value === undefined) {
    return [];
  }

  if (!Array.isArray(value)) {
    return value ? [value] : [];
  }

  return value;
}

/**
 * Build field metadata from content type schema
 * @param {Object} schema - Content type schema
 * @returns {Object} - Field metadata map
 */
function buildFieldMetadata(schema) {
  const metadata = {};

  if (!schema || !schema.attributes) {
    return metadata;
  }

  Object.keys(schema.attributes).forEach(key => {
    const attribute = schema.attributes[key];
    
    metadata[key] = {
      type: attribute.type,
      required: attribute.required || false,
      unique: attribute.unique || false
    };

    // Add relation-specific metadata
    if (attribute.type === 'relation') {
      metadata[key].relation = attribute.relation;
      metadata[key].cardinality = getRelationCardinality(attribute.relation);
      metadata[key].target = attribute.target;
    }

    // Add media-specific metadata
    if (attribute.type === 'media') {
      metadata[key].multiple = attribute.multiple || false;
      metadata[key].allowedTypes = attribute.allowedTypes || ['images', 'files', 'videos', 'audios'];
    }

    // Add component-specific metadata
    if (attribute.type === 'component') {
      metadata[key].repeatable = attribute.repeatable || false;
      metadata[key].component = attribute.component;
    }

    // Add dynamic zone metadata
    if (attribute.type === 'dynamiczone') {
      metadata[key].components = attribute.components || [];
    }
  });

  return metadata;
}

/**
 * Determine relation cardinality from relation type
 * @param {string} relationType - Strapi relation type
 * @returns {string} - Cardinality (one or many)
 */
function getRelationCardinality(relationType) {
  if (!relationType) {
    return 'many';
  }

  const oneRelations = ['oneToOne', 'manyToOne'];
  const manyRelations = ['oneToMany', 'manyToMany'];

  if (oneRelations.includes(relationType)) {
    return 'one';
  }

  if (manyRelations.includes(relationType)) {
    return 'many';
  }

  // Default to many for safety
  return 'many';
}

/**
 * Apply response transformation to API response
 * @param {Object} ctx - Koa context
 * @param {any} data - Response data
 * @param {Object} metadata - Field metadata
 * @param {Object} options - Transformation options
 */
function applyResponseTransformation(ctx, data, metadata = {}, options = {}) {
  const transformedData = transformResponse(data, metadata, options);
  
  // Preserve pagination metadata if it exists
  if (ctx.body && ctx.body.meta) {
    ctx.body = {
      data: transformedData,
      meta: ctx.body.meta
    };
  } else {
    ctx.body = transformedData;
  }
}

module.exports = {
  transformResponse,
  transformSingleItem,
  transformRelation,
  transformMedia,
  extractMediaData,
  transformComponent,
  transformDynamicZone,
  buildFieldMetadata,
  getRelationCardinality,
  applyResponseTransformation
};