export const TRUNCATE_LENGTH = 45;
export const TRUNCATE_LENGTH_LONG = 70;
export const STORAGE_KEY = "myLeadsByFolder";

/**
 * Truncates a string to a max length, appending '...'.
 *
 * @param {string} name - The string to truncate.
 * @param {number} [maxLength=TRUNCATE_LENGTH] - Maximum length.
 * @returns {string} The truncated string.
 */
export const truncateName = (name, maxLength = TRUNCATE_LENGTH) => {
  if (!name) return "";
  if (name.length > maxLength) {
    return name.substring(0, maxLength) + "...";
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
      "My Leads": data.map((lead) => ({
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
      if (typeof lead === "string") {
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
