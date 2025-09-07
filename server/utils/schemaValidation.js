/**
 * Schema validation utilities for Custom API Builder
 * Handles schema changes, field deletions, and migrations
 */

/**
 * Validate saved API structure against current content type schema
 * @param {Object} savedStructure - Previously saved API structure
 * @param {Object} currentSchema - Current content type schema
 * @returns {Object} - Validation result with warnings and fixes
 */
function validateApiStructure(savedStructure, currentSchema) {
  const validation = {
    isValid: true,
    warnings: [],
    errors: [],
    removedFields: [],
    addedFields: [],
    modifiedFields: [],
    suggestions: []
  };

  if (!savedStructure || !currentSchema) {
    validation.errors.push('Missing structure or schema for validation');
    validation.isValid = false;
    return validation;
  }

  // Get current field names from schema
  const currentFields = new Set(
    Object.keys(currentSchema.attributes || {})
  );

  // Check saved fields against current schema
  const savedFields = extractFieldsFromStructure(savedStructure);
  
  savedFields.forEach(fieldName => {
    if (!currentFields.has(fieldName)) {
      validation.removedFields.push(fieldName);
      validation.warnings.push(`Field "${fieldName}" no longer exists in content type`);
    }
  });

  // Check for new fields added to schema
  currentFields.forEach(fieldName => {
    if (!savedFields.has(fieldName)) {
      validation.addedFields.push(fieldName);
      validation.suggestions.push(`New field "${fieldName}" is available for selection`);
    }
  });

  // Check for modified field types
  savedFields.forEach(fieldName => {
    if (currentFields.has(fieldName)) {
      const savedType = getFieldTypeFromStructure(savedStructure, fieldName);
      const currentType = currentSchema.attributes[fieldName]?.type;
      
      if (savedType && currentType && savedType !== currentType) {
        validation.modifiedFields.push({
          field: fieldName,
          oldType: savedType,
          newType: currentType
        });
        validation.warnings.push(
          `Field "${fieldName}" type changed from "${savedType}" to "${currentType}"`
        );
      }
    }
  });

  // Set validity based on critical issues
  validation.isValid = validation.errors.length === 0;

  return validation;
}

/**
 * Clean API structure by removing deleted fields
 * @param {Object} structure - API structure to clean
 * @param {Object} schema - Current content type schema
 * @returns {Object} - Cleaned structure
 */
function cleanApiStructure(structure, schema) {
  if (!structure || !schema) {
    return structure;
  }

  const currentFields = new Set(
    Object.keys(schema.attributes || {})
  );

  return cleanStructureRecursive(structure, currentFields);
}

/**
 * Recursively clean structure removing non-existent fields
 * @param {any} obj - Object to clean
 * @param {Set} validFields - Set of valid field names
 * @returns {any} - Cleaned object
 */
function cleanStructureRecursive(obj, validFields) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj
      .map(item => cleanStructureRecursive(item, validFields))
      .filter(item => {
        // Remove field items that no longer exist
        if (item && item.name && !validFields.has(item.name)) {
          return false;
        }
        return true;
      });
  }

  const cleaned = {};
  Object.keys(obj).forEach(key => {
    if (key === 'fields') {
      // Clean fields array
      cleaned[key] = obj[key].filter(field => {
        const fieldName = typeof field === 'string' ? field : field.name;
        return validFields.has(fieldName);
      });
    } else if (key === 'populate' && typeof obj[key] === 'object') {
      // Clean populate object
      const cleanedPopulate = {};
      Object.keys(obj[key]).forEach(populateKey => {
        if (validFields.has(populateKey)) {
          cleanedPopulate[populateKey] = cleanStructureRecursive(
            obj[key][populateKey],
            validFields
          );
        }
      });
      if (Object.keys(cleanedPopulate).length > 0) {
        cleaned[key] = cleanedPopulate;
      }
    } else {
      cleaned[key] = cleanStructureRecursive(obj[key], validFields);
    }
  });

  return cleaned;
}

/**
 * Extract field names from saved structure
 * @param {Object} structure - Saved API structure
 * @returns {Set} - Set of field names
 */
function extractFieldsFromStructure(structure) {
  const fields = new Set();

  if (!structure) {
    return fields;
  }

  // Recursively extract field names
  const extract = (obj) => {
    if (!obj || typeof obj !== 'object') {
      return;
    }

    if (Array.isArray(obj)) {
      obj.forEach(extract);
      return;
    }

    if (obj.fields && Array.isArray(obj.fields)) {
      obj.fields.forEach(field => {
        const fieldName = typeof field === 'string' ? field : field.name;
        if (fieldName) {
          fields.add(fieldName);
        }
      });
    }

    if (obj.structure) {
      extract(obj.structure);
    }

    if (obj.populate) {
      Object.keys(obj.populate).forEach(key => {
        fields.add(key);
        extract(obj.populate[key]);
      });
    }
  };

  extract(structure);
  return fields;
}

/**
 * Get field type from structure
 * @param {Object} structure - Saved structure
 * @param {string} fieldName - Field name to find
 * @returns {string|null} - Field type or null
 */
function getFieldTypeFromStructure(structure, fieldName) {
  if (!structure || !fieldName) {
    return null;
  }

  // Search for field type in structure
  const search = (obj) => {
    if (!obj || typeof obj !== 'object') {
      return null;
    }

    if (Array.isArray(obj)) {
      for (const item of obj) {
        const result = search(item);
        if (result) return result;
      }
      return null;
    }

    if (obj.fields && Array.isArray(obj.fields)) {
      for (const field of obj.fields) {
        if (typeof field === 'object' && field.name === fieldName) {
          return field.type || null;
        }
      }
    }

    if (obj.structure) {
      const result = search(obj.structure);
      if (result) return result;
    }

    return null;
  };

  return search(structure);
}

/**
 * Generate migration suggestions for schema changes
 * @param {Object} validation - Validation result
 * @returns {Array} - Migration suggestions
 */
function generateMigrationSuggestions(validation) {
  const suggestions = [];

  if (validation.removedFields.length > 0) {
    suggestions.push({
      type: 'warning',
      title: 'Removed Fields Detected',
      description: `${validation.removedFields.length} field(s) have been removed from the content type`,
      fields: validation.removedFields,
      action: 'These fields will be automatically removed from your API configuration'
    });
  }

  if (validation.addedFields.length > 0) {
    suggestions.push({
      type: 'info',
      title: 'New Fields Available',
      description: `${validation.addedFields.length} new field(s) are available`,
      fields: validation.addedFields,
      action: 'Consider adding these fields to your API configuration'
    });
  }

  if (validation.modifiedFields.length > 0) {
    suggestions.push({
      type: 'warning',
      title: 'Field Type Changes',
      description: 'Some field types have changed',
      fields: validation.modifiedFields.map(f => 
        `${f.field}: ${f.oldType} → ${f.newType}`
      ),
      action: 'Review these changes to ensure your API works as expected'
    });
  }

  return suggestions;
}

/**
 * Auto-fix common schema issues
 * @param {Object} structure - API structure
 * @param {Object} schema - Current schema
 * @param {Object} options - Fix options
 * @returns {Object} - Fixed structure
 */
function autoFixStructure(structure, schema, options = {}) {
  const {
    removeDeleted = true,
    addNewFields = false,
    updateTypes = true
  } = options;

  let fixed = { ...structure };

  if (removeDeleted) {
    fixed = cleanApiStructure(fixed, schema);
  }

  if (addNewFields) {
    const validation = validateApiStructure(structure, schema);
    if (validation.addedFields.length > 0) {
      // Add logic to automatically add new fields if needed
      // This would require more complex structure manipulation
    }
  }

  if (updateTypes) {
    // Update field types in structure to match current schema
    // This would require traversing and updating the structure
  }

  return fixed;
}

module.exports = {
  validateApiStructure,
  cleanApiStructure,
  cleanStructureRecursive,
  extractFieldsFromStructure,
  getFieldTypeFromStructure,
  generateMigrationSuggestions,
  autoFixStructure
};