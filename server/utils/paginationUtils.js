/**
 * Pagination utilities for Custom API Builder
 * Provides safe pagination capabilities for generated API endpoints
 */

/**
 * Parse pagination parameters into Strapi v5 pagination format
 * @param {Object} query - Raw query parameters from request
 * @param {Object} options - Pagination configuration options
 * @returns {Object} - Parsed pagination configuration in Strapi v5 format
 */
function parsePagination(query, options = {}) {
  const {
    defaultPageSize = 25,
    maxPageSize = 100,
    minPageSize = 1,
    allowUnpaginated = false
  } = options;

  if (!query || typeof query !== 'object') {
    return getDefaultPagination(defaultPageSize);
  }

  // Check if pagination is explicitly disabled
  if (query.pagination === 'false' || query.pagination === false) {
    if (allowUnpaginated) {
      return { page: 1, pageSize: -1 }; // -1 indicates no pagination
    }
    return getDefaultPagination(defaultPageSize);
  }

  // Parse different pagination formats
  const pagination = {};

  // Handle page-based pagination
  // Format 1: ?page=2&pageSize=10
  // Format 2: ?pagination[page]=2&pagination[pageSize]=10
  const page = parsePageNumber(
    query.page || 
    query['pagination[page]'] || 
    (typeof query.pagination === 'object' ? query.pagination.page : null)
  );

  const pageSize = parsePageSize(
    query.pageSize || 
    query.pagesize || 
    query['pagination[pageSize]'] || 
    query['pagination[pagesize]'] ||
    (typeof query.pagination === 'object' ? query.pagination.pageSize || query.pagination.pagesize : null),
    { defaultPageSize, maxPageSize, minPageSize }
  );

  // Handle offset/limit pagination (convert to page-based)
  const offset = parseNumber(query.offset || query.skip);
  const limit = parseNumber(query.limit || query.take);

  if (offset !== null && limit !== null) {
    // Convert offset/limit to page/pageSize
    pagination.page = Math.floor(offset / limit) + 1;
    pagination.pageSize = limit;
  } else {
    pagination.page = page;
    pagination.pageSize = pageSize;
  }

  // Validate and sanitize
  pagination.page = Math.max(1, pagination.page);
  pagination.pageSize = Math.min(maxPageSize, Math.max(minPageSize, pagination.pageSize));

  return pagination;
}

/**
 * Get default pagination configuration
 * @param {number} defaultPageSize - Default page size
 * @returns {Object} - Default pagination object
 */
function getDefaultPagination(defaultPageSize = 25) {
  return {
    page: 1,
    pageSize: defaultPageSize
  };
}

/**
 * Parse page number from various input formats
 * @param {any} value - Raw page value
 * @returns {number} - Parsed page number
 */
function parsePageNumber(value) {
  if (value === null || value === undefined) {
    return 1;
  }

  const parsed = parseInt(value, 10);
  return isNaN(parsed) || parsed < 1 ? 1 : parsed;
}

/**
 * Parse page size from various input formats
 * @param {any} value - Raw page size value
 * @param {Object} options - Size constraints
 * @returns {number} - Parsed page size
 */
function parsePageSize(value, options = {}) {
  const { defaultPageSize = 25, maxPageSize = 100, minPageSize = 1 } = options;

  if (value === null || value === undefined) {
    return defaultPageSize;
  }

  // Handle special values
  if (value === 'all' || value === '-1' || value === -1) {
    return maxPageSize; // Return max instead of unlimited for safety
  }

  const parsed = parseInt(value, 10);
  if (isNaN(parsed) || parsed < minPageSize) {
    return defaultPageSize;
  }

  return Math.min(parsed, maxPageSize);
}

/**
 * Parse a number value safely
 * @param {any} value - Value to parse
 * @returns {number|null} - Parsed number or null
 */
function parseNumber(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Calculate pagination metadata
 * @param {Object} pagination - Current pagination config
 * @param {number} total - Total number of items
 * @returns {Object} - Pagination metadata
 */
function calculatePaginationMeta(pagination, total) {
  const { page, pageSize } = pagination;
  const pageCount = Math.ceil(total / pageSize);
  
  return {
    pagination: {
      page: page,
      pageSize: pageSize,
      pageCount: pageCount,
      total: total,
      // Additional useful metadata
      hasNextPage: page < pageCount,
      hasPreviousPage: page > 1,
      firstPage: 1,
      lastPage: pageCount,
      start: (page - 1) * pageSize + 1,
      end: Math.min(page * pageSize, total)
    }
  };
}

/**
 * Build pagination links for API responses
 * @param {string} baseUrl - Base URL for the API
 * @param {Object} pagination - Current pagination
 * @param {number} total - Total items
 * @param {Object} otherParams - Other query parameters to preserve
 * @returns {Object} - Links object
 */
function buildPaginationLinks(baseUrl, pagination, total, otherParams = {}) {
  const { page, pageSize } = pagination;
  const pageCount = Math.ceil(total / pageSize);
  const links = {};

  // Helper to build URL with params
  const buildUrl = (pageNum) => {
    const params = new URLSearchParams({
      ...otherParams,
      page: pageNum,
      pageSize: pageSize
    });
    return `${baseUrl}?${params.toString()}`;
  };

  // Always include self
  links.self = buildUrl(page);

  // First and last pages
  links.first = buildUrl(1);
  links.last = buildUrl(pageCount);

  // Previous page
  if (page > 1) {
    links.prev = buildUrl(page - 1);
  }

  // Next page
  if (page < pageCount) {
    links.next = buildUrl(page + 1);
  }

  return links;
}

/**
 * Validate pagination configuration
 * @param {Object} pagination - Pagination config to validate
 * @param {Object} options - Validation options
 * @returns {Object} - Validation result
 */
function validatePagination(pagination, options = {}) {
  const errors = [];
  const warnings = [];
  const { maxPageSize = 100, warnLargePageSize = 50 } = options;

  if (!pagination || typeof pagination !== 'object') {
    errors.push('Pagination configuration must be an object');
    return { isValid: false, errors, warnings };
  }

  // Validate page
  if (typeof pagination.page !== 'number' || pagination.page < 1) {
    errors.push('Page must be a positive number');
  }

  // Validate pageSize
  if (typeof pagination.pageSize !== 'number' || pagination.pageSize < 1) {
    errors.push('Page size must be a positive number');
  } else {
    if (pagination.pageSize > maxPageSize) {
      errors.push(`Page size ${pagination.pageSize} exceeds maximum of ${maxPageSize}`);
    }
    if (pagination.pageSize > warnLargePageSize) {
      warnings.push(`Large page size (${pagination.pageSize}) may impact performance`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Build comprehensive pagination documentation
 * @param {Object} options - Documentation options
 * @returns {Object} - Pagination documentation object
 */
function buildPaginationDocumentation(options = {}) {
  const {
    defaultPageSize = 25,
    maxPageSize = 100,
    minPageSize = 1
  } = options;

  return {
    description: 'Paginate results using query parameters',
    formats: {
      pageBased: {
        description: 'Page-based pagination (recommended)',
        examples: [
          '?page=1&pageSize=25',
          '?page=2&pageSize=50',
          '?pagination[page]=3&pagination[pageSize]=10'
        ]
      },
      offsetBased: {
        description: 'Offset-based pagination (legacy)',
        examples: [
          '?offset=0&limit=25',
          '?skip=50&take=25',
          '?offset=100&limit=50'
        ]
      }
    },
    parameters: {
      page: {
        type: 'integer',
        description: 'Page number (starts at 1)',
        default: 1,
        minimum: 1
      },
      pageSize: {
        type: 'integer',
        description: 'Number of items per page',
        default: defaultPageSize,
        minimum: minPageSize,
        maximum: maxPageSize
      },
      offset: {
        type: 'integer',
        description: 'Number of items to skip (alternative to page)',
        default: 0,
        minimum: 0
      },
      limit: {
        type: 'integer',
        description: 'Number of items to return (alternative to pageSize)',
        default: defaultPageSize,
        minimum: minPageSize,
        maximum: maxPageSize
      }
    },
    response: {
      description: 'Paginated responses include metadata',
      example: {
        data: '[...items...]',
        meta: {
          pagination: {
            page: 1,
            pageSize: 25,
            pageCount: 4,
            total: 95,
            hasNextPage: true,
            hasPreviousPage: false
          }
        }
      }
    },
    notes: {
      performance: `Large page sizes (>${maxPageSize/2}) may impact response time`,
      limits: `Maximum page size is ${maxPageSize} items`,
      defaults: `Default page size is ${defaultPageSize} items`
    }
  };
}

module.exports = {
  parsePagination,
  getDefaultPagination,
  parsePageNumber,
  parsePageSize,
  parseNumber,
  calculatePaginationMeta,
  buildPaginationLinks,
  validatePagination,
  buildPaginationDocumentation
};