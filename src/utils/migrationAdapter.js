import { truncateName } from './helpers';

/**
 * @typedef {Object} LeadV1
 * @property {string} id
 * @property {string} url
 * @property {string} name
 */

/**
 * @typedef {Object} FolderV2
 * @property {string} id - UUID of the folder
 * @property {string} name - Name of the folder
 * @property {Array<LeadV1>} items - List of leads
 */

/**
 * Migrates data from V1 (Object) to V2 (Array of Objects).
 * Handles idempotency (if data is already V2-like, needs check).
 *
 * @param {Object} v1Data - The legacy data { "Folder": [leads] }
 * @returns {Array<FolderV2>} The new data structure
 */
export const migrateV1toV2 = (v1Data) => {
  if (!v1Data) return [];

  // Idempotency check: If it's already an array, assume it's V2
  if (Array.isArray(v1Data)) {
    return v1Data;
  }

  // Transformation: Object -> Array
  return Object.keys(v1Data).map((folderName) => {
    return {
      id: crypto.randomUUID(), // New Folder ID
      name: folderName,
      items: v1Data[folderName].map((lead) => ({
        ...lead,
        // Ensure lead has ID if missing (legacy-legacy)
        id: lead.id || crypto.randomUUID(),
      })),
    };
  });
};
