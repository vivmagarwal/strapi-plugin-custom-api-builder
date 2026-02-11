import { kebabCase } from './helpers';
import customApiRequest from '../api/custom-api';
const slugify = kebabCase;

/**
 * Generate a URL-friendly slug from a name
 * @param {string} name - The name to convert to a slug
 * @returns {string} - The generated slug
 */
export const generateSlug = (name) => {
  if (!name || typeof name !== 'string') {
    return '';
  }

  // Use kebabCase to convert to slug format
  let slug = slugify(name.trim());
  
  // Ensure the slug is valid for URLs
  slug = slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')  // Replace any non-alphanumeric characters with dashes
    .replace(/-+/g, '-')          // Replace multiple consecutive dashes with single dash
    .replace(/^-+|-+$/g, '');     // Remove leading and trailing dashes
  
  // Ensure slug is not empty
  if (!slug) {
    slug = 'custom-api';
  }
  
  return slug;
};

/**
 * Validate if a slug meets the requirements
 * @param {string} slug - The slug to validate
 * @returns {object} - Validation result with isValid and errors
 */
export const validateSlug = (slug) => {
  const errors = [];
  
  if (!slug || typeof slug !== 'string') {
    errors.push('Slug is required');
    return { isValid: false, errors };
  }

  const trimmedSlug = slug.trim();
  
  // Check minimum length
  if (trimmedSlug.length < 1) {
    errors.push('Slug must not be empty');
  }
  
  // Check maximum length
  if (trimmedSlug.length > 100) {
    errors.push('Slug must not exceed 100 characters');
  }
  
  // Check format (only lowercase letters, numbers, and hyphens)
  if (!/^[a-z0-9-]+$/.test(trimmedSlug)) {
    errors.push('Slug can only contain lowercase letters, numbers, and hyphens');
  }
  
  // Check that it doesn't start or end with hyphen
  if (trimmedSlug.startsWith('-') || trimmedSlug.endsWith('-')) {
    errors.push('Slug cannot start or end with a hyphen');
  }
  
  // Check for consecutive hyphens
  if (trimmedSlug.includes('--')) {
    errors.push('Slug cannot contain consecutive hyphens');
  }
  
  // Check reserved words that might conflict with Strapi routes
  const reservedWords = ['api', 'admin', 'content-manager', 'content-type-builder', 'upload', 'users-permissions'];
  if (reservedWords.includes(trimmedSlug)) {
    errors.push(`"${trimmedSlug}" is a reserved word and cannot be used as a slug`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Check if a slug is unique by making an API call
 * @param {string} slug - The slug to check
 * @param {string} excludeId - ID to exclude from uniqueness check (for editing)
 * @returns {Promise<object>} - Uniqueness check result
 */
export const checkSlugUniqueness = async (slug, excludeId = null) => {
  if (!slug) {
    return { isUnique: false, error: 'Slug is required' };
  }

  try {
    const data = await customApiRequest.validateSlug(slug, excludeId);

    return {
      isUnique: data.isUnique,
      conflictingAPIs: data.conflictingAPIs || [],
      error: null
    };
  } catch (error) {
    console.error('Error checking slug uniqueness:', error);
    return {
      isUnique: false,
      error: 'Unable to verify slug uniqueness. Please try again.',
      conflictingAPIs: []
    };
  }
};

/**
 * Generate a unique slug from a name by adding a suffix if needed
 * @param {string} name - The name to convert to a slug
 * @param {string} excludeId - ID to exclude from uniqueness check (for editing)
 * @returns {Promise<string>} - A unique slug
 */
export const generateUniqueSlug = async (name, excludeId = null) => {
  const baseSlug = generateSlug(name);
  
  // Check if base slug is unique
  const uniqueCheck = await checkSlugUniqueness(baseSlug, excludeId);
  
  if (uniqueCheck.isUnique) {
    return baseSlug;
  }
  
  // If not unique, try adding numeric suffixes
  let counter = 1;
  let uniqueSlug = `${baseSlug}-${counter}`;
  
  while (counter <= 100) { // Prevent infinite loop
    const check = await checkSlugUniqueness(uniqueSlug, excludeId);
    
    if (check.isUnique) {
      return uniqueSlug;
    }
    
    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }
  
  // Fallback: add timestamp
  const timestamp = Date.now().toString().slice(-6);
  return `${baseSlug}-${timestamp}`;
};

export default {
  generateSlug,
  validateSlug,
  checkSlugUniqueness,
  generateUniqueSlug
};