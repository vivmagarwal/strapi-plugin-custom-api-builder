/**
 * Filter utilities for Custom API Builder
 * Provides safe filtering capabilities for generated API endpoints
 */

/**
 * Parse query parameters into Strapi v5 filter format
 * @param {Object} query - Raw query parameters from request
 * @param {Array} availableFields - List of fields available for filtering
 * @returns {Object} - Parsed filters in Strapi v5 format
 */
function parseFilters(query, availableFields = []) {
  const filters = {};
  
  if (!query || typeof query !== 'object') {
    return filters;
  }

  // Create a set of available field names for quick lookup
  const fieldSet = new Set(availableFields.map(field => 
    typeof field === 'string' ? field : field.name
  ));

  // Parse filters from query parameters
  Object.keys(query).forEach(key => {
    // Skip non-filter parameters
    if (['sort', 'pagination', 'populate', 'fields'].includes(key)) {
      return;
    }

    const value = query[key];
    
    // Handle different filter formats:
    // 1. Simple: ?name=John
    // 2. Operator: ?age[$gt]=18
    // 3. Multiple: ?status[$in]=active,pending

    if (key.includes('[$')) {
      // Operator-based filter: field[$operator]=value
      const [fieldName, operatorPart] = key.split('[$');
      const operator = operatorPart?.replace(']', '');
      
      if (fieldSet.has(fieldName) && isValidOperator(operator)) {
        if (!filters[fieldName]) {
          filters[fieldName] = {};
        }
        
        filters[fieldName][`$${operator}`] = parseFilterValue(value, operator);
      }
    } else if (fieldSet.has(key)) {
      // Simple equality filter: field=value
      filters[key] = { $eq: parseFilterValue(value, 'eq') };
    }
  });

  return filters;
}

/**
 * Validate if an operator is allowed
 * @param {string} operator - The filter operator to validate
 * @returns {boolean} - Whether the operator is valid
 */
function isValidOperator(operator) {
  const allowedOperators = [
    'eq', 'ne', 'gt', 'gte', 'lt', 'lte',
    'in', 'notIn', 'contains', 'notContains',
    'containsi', 'notContainsi', 'startsWith',
    'endsWith', 'null', 'notNull'
  ];
  
  return allowedOperators.includes(operator);
}

/**
 * Parse and sanitize filter values
 * @param {string|Array} value - Raw filter value
 * @param {string} operator - Filter operator
 * @returns {any} - Parsed filter value
 */
function parseFilterValue(value, operator) {
  if (value === null || value === undefined) {
    return null;
  }

  // Handle array operators (in, notIn)
  if (['in', 'notIn'].includes(operator)) {
    if (typeof value === 'string') {
      return value.split(',').map(v => v.trim()).filter(v => v.length > 0);
    }
    return Array.isArray(value) ? value : [value];
  }

  // Handle boolean-like values
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
    if (value.toLowerCase() === 'null') return null;
  }

  // Handle numeric values for comparison operators
  if (['gt', 'gte', 'lt', 'lte'].includes(operator)) {
    const numValue = Number(value);
    if (!isNaN(numValue)) {
      return numValue;
    }
  }

  // Return string value for text-based operators
  return value;
}

/**
 * Build comprehensive filter documentation for an API
 * @param {Array} fields - Available fields for filtering
 * @returns {Object} - Filter documentation object
 */
function buildFilterDocumentation(fields) {
  const fieldExamples = {};
  
  fields.forEach(field => {
    const fieldName = typeof field === 'string' ? field : field.name;
    const fieldType = typeof field === 'object' ? field.type : 'string';
    
    fieldExamples[fieldName] = {
      type: fieldType,
      examples: generateFieldExamples(fieldName, fieldType)
    };
  });

  return {
    description: 'Filter results using query parameters',
    syntax: {
      simple: '?fieldName=value',
      operator: '?fieldName[$operator]=value',
      multiple: '?field1=value1&field2[$gt]=value2'
    },
    operators: {
      '$eq': 'Equal to (default)',
      '$ne': 'Not equal to',
      '$gt': 'Greater than',
      '$gte': 'Greater than or equal',
      '$lt': 'Less than',
      '$lte': 'Less than or equal',
      '$in': 'In array (comma-separated)',
      '$notIn': 'Not in array (comma-separated)',
      '$contains': 'Contains (case-sensitive)',
      '$notContains': 'Does not contain (case-sensitive)',
      '$containsi': 'Contains (case-insensitive)',
      '$notContainsi': 'Does not contain (case-insensitive)',
      '$startsWith': 'Starts with',
      '$endsWith': 'Ends with',
      '$null': 'Is null (use true/false)',
      '$notNull': 'Is not null (use true/false)'
    },
    fields: fieldExamples
  };
}

/**
 * Generate example filter queries for a field
 * @param {string} fieldName - Name of the field
 * @param {string} fieldType - Type of the field
 * @returns {Array} - Array of example queries
 */
function generateFieldExamples(fieldName, fieldType) {
  const examples = [
    `?${fieldName}=example`,
    `?${fieldName}[$ne]=unwanted`
  ];

  switch (fieldType) {
    case 'string':
    case 'text':
    case 'richtext':
      examples.push(
        `?${fieldName}[$contains]=search`,
        `?${fieldName}[$containsi]=Search`,
        `?${fieldName}[$startsWith]=prefix`
      );
      break;
      
    case 'integer':
    case 'biginteger':
    case 'float':
    case 'decimal':
      examples.push(
        `?${fieldName}[$gt]=100`,
        `?${fieldName}[$gte]=50`,
        `?${fieldName}[$lt]=200`,
        `?${fieldName}[$in]=10,20,30`
      );
      break;
      
    case 'boolean':
      examples.push(
        `?${fieldName}=true`,
        `?${fieldName}=false`
      );
      break;
      
    case 'date':
    case 'datetime':
      examples.push(
        `?${fieldName}[$gt]=2023-01-01`,
        `?${fieldName}[$gte]=2023-01-01T00:00:00Z`,
        `?${fieldName}[$lt]=2024-01-01`
      );
      break;
      
    case 'enumeration':
      examples.push(
        `?${fieldName}[$in]=option1,option2`,
        `?${fieldName}[$notIn]=excluded`
      );
      break;
  }

  return examples;
}

/**
 * Validate filters against available fields and their types
 * @param {Object} filters - Parsed filters
 * @param {Array} fields - Available field definitions
 * @returns {Object} - Validation result with errors
 */
function validateFilters(filters, fields) {
  const errors = [];
  const warnings = [];
  
  const fieldMap = new Map();
  fields.forEach(field => {
    const fieldName = typeof field === 'string' ? field : field.name;
    const fieldType = typeof field === 'object' ? field.type : 'string';
    fieldMap.set(fieldName, { name: fieldName, type: fieldType, ...field });
  });

  Object.keys(filters).forEach(fieldName => {
    if (!fieldMap.has(fieldName)) {
      errors.push(`Field "${fieldName}" is not available for filtering`);
      return;
    }

    const fieldDef = fieldMap.get(fieldName);
    const fieldFilters = filters[fieldName];

    Object.keys(fieldFilters).forEach(operator => {
      // Validate operator compatibility with field type
      const compatibilityCheck = checkOperatorCompatibility(operator, fieldDef.type);
      if (!compatibilityCheck.compatible) {
        warnings.push(`Operator "${operator}" may not work well with field "${fieldName}" of type "${fieldDef.type}": ${compatibilityCheck.reason}`);
      }
    });
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Check if an operator is compatible with a field type
 * @param {string} operator - Filter operator
 * @param {string} fieldType - Field type
 * @returns {Object} - Compatibility result
 */
function checkOperatorCompatibility(operator, fieldType) {
  const numericTypes = ['integer', 'biginteger', 'float', 'decimal'];
  const textTypes = ['string', 'text', 'richtext', 'email', 'password'];
  const dateTypes = ['date', 'datetime', 'time'];

  const compatibilityMap = {
    '$gt': [...numericTypes, ...dateTypes],
    '$gte': [...numericTypes, ...dateTypes],
    '$lt': [...numericTypes, ...dateTypes],
    '$lte': [...numericTypes, ...dateTypes],
    '$contains': textTypes,
    '$notContains': textTypes,
    '$containsi': textTypes,
    '$notContainsi': textTypes,
    '$startsWith': textTypes,
    '$endsWith': textTypes
  };

  const compatibleTypes = compatibilityMap[operator];
  if (compatibleTypes && !compatibleTypes.includes(fieldType)) {
    return {
      compatible: false,
      reason: `Expected field types: ${compatibleTypes.join(', ')}, got: ${fieldType}`
    };
  }

  return { compatible: true };
}

module.exports = {
  parseFilters,
  isValidOperator,
  parseFilterValue,
  buildFilterDocumentation,
  generateFieldExamples,
  validateFilters,
  checkOperatorCompatibility
};