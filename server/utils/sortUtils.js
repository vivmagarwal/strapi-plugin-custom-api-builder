/**
 * Sort utilities for Custom API Builder
 * Provides safe sorting capabilities for generated API endpoints
 */

/**
 * Parse sort parameters into Strapi v5 sort format
 * @param {Object} query - Raw query parameters from request
 * @param {Array} availableFields - List of fields available for sorting
 * @returns {Array|Object} - Parsed sort configuration in Strapi v5 format
 */
function parseSort(query, availableFields = []) {
  if (!query || typeof query !== 'object') {
    return [];
  }

  // Create a set of available field names for quick lookup
  const fieldSet = new Set(availableFields.map(field => 
    typeof field === 'string' ? field : field.name
  ));

  const sortParam = query.sort;
  
  if (!sortParam) {
    return [];
  }

  // Handle string sort parameter: "name,-createdAt,age"
  if (typeof sortParam === 'string') {
    return parseSortString(sortParam, fieldSet);
  }

  // Handle array sort parameter: ["name", "-createdAt"]  
  if (Array.isArray(sortParam)) {
    return parseSortArray(sortParam, fieldSet);
  }

  // Handle object sort parameter: { name: 'asc', createdAt: 'desc' }
  if (typeof sortParam === 'object') {
    return parseSortObject(sortParam, fieldSet);
  }

  return [];
}

/**
 * Parse comma-separated sort string
 * @param {string} sortString - Sort string like "name,-createdAt,age"
 * @param {Set} fieldSet - Available field names
 * @returns {Array} - Parsed sort array
 */
function parseSortString(sortString, fieldSet) {
  const sortArray = [];
  const fields = sortString.split(',').map(f => f.trim()).filter(f => f.length > 0);

  fields.forEach(field => {
    let direction = 'asc';
    let fieldName = field;

    // Check for descending order prefix
    if (field.startsWith('-')) {
      direction = 'desc';
      fieldName = field.substring(1);
    } else if (field.startsWith('+')) {
      direction = 'asc';
      fieldName = field.substring(1);
    }

    // Validate field exists
    if (fieldSet.has(fieldName)) {
      sortArray.push({ [fieldName]: direction });
    }
  });

  return sortArray;
}

/**
 * Parse sort array format
 * @param {Array} sortArray - Array of sort strings
 * @param {Set} fieldSet - Available field names
 * @returns {Array} - Parsed sort array
 */
function parseSortArray(sortArray, fieldSet) {
  const result = [];

  sortArray.forEach(item => {
    if (typeof item === 'string') {
      const parsed = parseSortString(item, fieldSet);
      result.push(...parsed);
    }
  });

  return result;
}

/**
 * Parse sort object format
 * @param {Object} sortObject - Object with field: direction pairs
 * @param {Set} fieldSet - Available field names
 * @returns {Array} - Parsed sort array
 */
function parseSortObject(sortObject, fieldSet) {
  const sortArray = [];

  Object.keys(sortObject).forEach(fieldName => {
    if (fieldSet.has(fieldName)) {
      const direction = normalizeSortDirection(sortObject[fieldName]);
      if (direction) {
        sortArray.push({ [fieldName]: direction });
      }
    }
  });

  return sortArray;
}

/**
 * Normalize sort direction to 'asc' or 'desc'
 * @param {string} direction - Raw direction value
 * @returns {string|null} - Normalized direction or null if invalid
 */
function normalizeSortDirection(direction) {
  if (!direction || typeof direction !== 'string') {
    return null;
  }

  const normalized = direction.toLowerCase().trim();
  
  switch (normalized) {
    case 'asc':
    case 'ascending':
    case '1':
    case 'up':
      return 'asc';
    case 'desc':
    case 'descending':
    case '-1':
    case 'down':
      return 'desc';
    default:
      return null;
  }
}

/**
 * Validate sort configuration against available fields
 * @param {Array} sortConfig - Parsed sort configuration
 * @param {Array} fields - Available field definitions
 * @returns {Object} - Validation result with errors and warnings
 */
function validateSort(sortConfig, fields) {
  const errors = [];
  const warnings = [];
  
  if (!Array.isArray(sortConfig)) {
    errors.push('Sort configuration must be an array');
    return { isValid: false, errors, warnings };
  }

  const fieldMap = new Map();
  fields.forEach(field => {
    const fieldName = typeof field === 'string' ? field : field.name;
    const fieldType = typeof field === 'object' ? field.type : 'string';
    fieldMap.set(fieldName, { name: fieldName, type: fieldType, ...field });
  });

  sortConfig.forEach((sortItem, index) => {
    if (typeof sortItem !== 'object' || Array.isArray(sortItem)) {
      errors.push(`Sort item at index ${index} must be an object`);
      return;
    }

    const fieldNames = Object.keys(sortItem);
    if (fieldNames.length !== 1) {
      errors.push(`Sort item at index ${index} must have exactly one field`);
      return;
    }

    const fieldName = fieldNames[0];
    const direction = sortItem[fieldName];

    if (!fieldMap.has(fieldName)) {
      errors.push(`Field "${fieldName}" is not available for sorting`);
      return;
    }

    if (!['asc', 'desc'].includes(direction)) {
      errors.push(`Invalid sort direction "${direction}" for field "${fieldName}". Must be 'asc' or 'desc'`);
      return;
    }

    // Check for sorting compatibility warnings
    const fieldDef = fieldMap.get(fieldName);
    const compatibilityCheck = checkSortCompatibility(fieldName, fieldDef.type);
    if (!compatibilityCheck.compatible) {
      warnings.push(`Sorting by "${fieldName}" (${fieldDef.type}): ${compatibilityCheck.reason}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Check if a field type is suitable for sorting
 * @param {string} fieldName - Name of the field
 * @param {string} fieldType - Type of the field
 * @returns {Object} - Compatibility result
 */
function checkSortCompatibility(fieldName, fieldType) {
  const nonsortableTypes = ['json', 'media', 'component', 'dynamiczone', 'relation'];
  const textTypes = ['text', 'richtext'];
  
  if (nonsortableTypes.includes(fieldType)) {
    return {
      compatible: false,
      reason: `Field type "${fieldType}" is not suitable for sorting`
    };
  }

  if (textTypes.includes(fieldType)) {
    return {
      compatible: true,
      reason: `Sorting by "${fieldType}" field may have performance implications for large datasets`
    };
  }

  return { compatible: true };
}

/**
 * Build comprehensive sort documentation for an API
 * @param {Array} fields - Available fields for sorting
 * @returns {Object} - Sort documentation object
 */
function buildSortDocumentation(fields) {
  const fieldExamples = {};
  
  fields.forEach(field => {
    const fieldName = typeof field === 'string' ? field : field.name;
    const fieldType = typeof field === 'object' ? field.type : 'string';
    
    const compatibility = checkSortCompatibility(fieldName, fieldType);
    
    fieldExamples[fieldName] = {
      type: fieldType,
      sortable: compatibility.compatible,
      examples: compatibility.compatible ? generateSortExamples(fieldName, fieldType) : [],
      note: !compatibility.compatible ? compatibility.reason : compatibility.reason || null
    };
  });

  return {
    description: 'Sort results using query parameters',
    syntax: {
      string: '?sort=field1,-field2,field3',
      object: '?sort[field1]=asc&sort[field2]=desc',
      multiple: '?sort=name,-createdAt&filters...'
    },
    directions: {
      'asc': 'Ascending order (A-Z, 0-9, oldest first)',
      'desc': 'Descending order (Z-A, 9-0, newest first)',
      'prefixes': {
        '+field': 'Ascending (explicit)',
        '-field': 'Descending (shorthand)',
        'field': 'Ascending (default)'
      }
    },
    fields: fieldExamples,
    notes: {
      multiple: 'Multiple sort fields are applied in order of specification',
      performance: 'Complex sorting on text fields may impact performance',
      indexing: 'Consider database indexes for frequently sorted fields'
    }
  };
}

/**
 * Generate example sort queries for a field
 * @param {string} fieldName - Name of the field
 * @param {string} fieldType - Type of the field
 * @returns {Array} - Array of example queries
 */
function generateSortExamples(fieldName, fieldType) {
  const examples = [
    `?sort=${fieldName}`,
    `?sort=-${fieldName}`,
    `?sort=${fieldName}&sort[otherField]=desc`
  ];

  switch (fieldType) {
    case 'datetime':
    case 'date':
      examples.push(
        `?sort=-${fieldName}  // Newest first`,
        `?sort=createdAt,-${fieldName}`
      );
      break;
      
    case 'integer':
    case 'biginteger':
    case 'float':
    case 'decimal':
      examples.push(
        `?sort=${fieldName}  // Smallest first`,
        `?sort=-${fieldName}  // Largest first`
      );
      break;
      
    case 'string':
    case 'email':
      examples.push(
        `?sort=${fieldName}  // A-Z`,
        `?sort=-${fieldName}  // Z-A`
      );
      break;
  }

  return examples.slice(0, 5); // Limit to 5 examples
}

module.exports = {
  parseSort,
  parseSortString,
  parseSortArray,
  parseSortObject,
  normalizeSortDirection,
  validateSort,
  checkSortCompatibility,
  buildSortDocumentation,
  generateSortExamples
};