import { TRUNCATE_LENGTH, FAVICON_URL_PREFIX, FAVICON_SIZE_PARAM } from '@/constants';

/**
 * Truncates a string to a max length, appending '...'.
 *
 * @param {string} name - The string to truncate.
 * @param {number} [maxLength=TRUNCATE_LENGTH] - Maximum length.
 * @returns {string} The truncated string.
 */
export const truncateName = (name, maxLength = TRUNCATE_LENGTH) => {
  if (!name) return '';
  if (name.length > maxLength) {
    return name.substring(0, maxLength) + '...';
  }
  return name;
};

/**
 * Migrates legacy data formats to the current structure.
 * Handles migration from Array format to Object format and ensures all leads have IDs.
 *
 * @param {Object|Array} data - The raw data from storage.
 * @returns {Object} The normalized data object { [folderName]: [leads] }.
 */
export const migrateData = (data) => {
  // If data is array (old format), convert to object
  if (Array.isArray(data)) {
    return {
      'My Leads': data.map((lead) => ({
        ...lead,
        id: lead.id || crypto.randomUUID(),
      })),
    };
  }

  // Ensure all leads have IDs
  const migrated = {};
  Object.keys(data).forEach((folder) => {
    migrated[folder] = data[folder].map((lead) => {
      // Handle string leads (legacy)
      if (typeof lead === 'string') {
        return {
          id: crypto.randomUUID(),
          url: lead,
          name: truncateName(lead),
        };
      }
      return {
        ...lead,
        id: lead.id || crypto.randomUUID(),
      };
    });
  });

  return migrated;
};

/**
 * Generates a Google S2 Favicon URL for a given link.
 *
 * @param {string} url - The website URL.
 * @returns {string} The favicon image URL.
 */
export const getFaviconUrl = (url) => {
  if (!url) return '';
  try {
    const domain = new URL(url).hostname;
    return `${FAVICON_URL_PREFIX}${domain}${FAVICON_SIZE_PARAM}`;
  } catch (e) {
    return ''; // Return empty string if invalid URL
  }
};
