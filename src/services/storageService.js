import { STORAGE_KEY, migrateData } from '@/utils';

/**
 * Loads leads data from Chrome storage or localStorage (fallback).
 * Handles migration from legacy formats.
 *
 * @returns {Promise<Object>} The loaded and migrated data object.
 */
export const loadLeadsFromStorage = async () => {
  return new Promise((resolve) => {
    // 1. Try Chrome Storage
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get([STORAGE_KEY], (result) => {
        if (chrome.runtime.lastError) {
          console.error('Storage error:', chrome.runtime.lastError);
          resolve({}); // Return empty on error to prevent crash
          return;
        }

        const stored = result[STORAGE_KEY];

        if (stored) {
          let parsed = stored;
          if (typeof stored === 'string') {
            try {
              parsed = JSON.parse(stored);
            } catch (e) {
              console.error('Error parsing stored data', e);
            }
          }
          const migrated = migrateData(parsed);
          resolve(migrated);
        } else {
          // 2. Fallback: Try LocalStorage (Migration scenario)
          const localStored = localStorage.getItem(STORAGE_KEY);
          if (localStored) {
            console.log('Migrating data from localStorage to chrome.storage.local...');
            try {
              const parsed = JSON.parse(localStored);
              const migrated = migrateData(parsed);

              // Persist migration immediately
              chrome.storage.local.set({ [STORAGE_KEY]: migrated });
              resolve(migrated);
            } catch (e) {
              console.error('Migration failed:', e);
              resolve({});
            }
          } else {
            resolve({}); // No data found
          }
        }
      });
    } else {
      // 3. Fallback: LocalStorage (Dev environment)
      console.warn('Chrome Storage API not available, falling back to localStorage');
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const migrated = migrateData(parsed);
          resolve(migrated);
        } catch (e) {
          console.error(e);
          resolve({});
        }
      } else {
        resolve({});
      }
    }
  });
};

/**
 * Saves leads data to Chrome storage or localStorage (fallback).
 *
 * @param {Object} data - The leads data object to save.
 * @returns {Promise<void>}
 */
export const saveLeadsToStorage = async (data) => {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ [STORAGE_KEY]: data }, () => {
        if (chrome.runtime.lastError) {
          console.error('Save error:', chrome.runtime.lastError);
        }
        resolve();
      });
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      resolve();
    }
  });
};
