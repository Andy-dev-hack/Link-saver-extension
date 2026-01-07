/**
 * Checks if a name is valid (non-empty string).
 * @param {string} name - The name to validate.
 * @returns {boolean} True if valid.
 */
export const isValidName = (name) => {
  return typeof name === 'string' && name.trim().length > 0;
};

/**
 * Checks if a folder name already exists in the list.
 * @param {Array<{name: string}>} folders - List of existing folders.
 * @param {string} name - The new folder name to check.
 * @returns {boolean} True if duplicate exists.
 */
export const isDuplicateFolder = (folders, name) => {
  if (!isValidName(name)) return false;
  return folders.some((f) => f.name.trim() === name.trim());
};
