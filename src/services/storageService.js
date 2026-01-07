import { migrateData, migrateV1toV2 } from '@/utils';
import { STORAGE_KEY_V1 as STORAGE_KEY, STORAGE_KEY_V2, STORAGE_KEY_BACKUP_V1 } from '@/constants';

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

/**
 * Creates a backup of the V1 data (myLeadsByFolder) to 'leads_backup_v1'.
 * This should be called strictly before any V2 migration.
 *
 * @returns {Promise<boolean>} True if backup was successful or already exists.
 */
export const backupV1Data = async () => {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      // Check if backup already exists
      chrome.storage.local.get([STORAGE_KEY_BACKUP_V1, STORAGE_KEY], (result) => {
        if (result[STORAGE_KEY_BACKUP_V1]) {
          console.log('Backup v1 already exists. Skipping.');
          resolve(true); // Backup already exists, safe to proceed
          return;
        }

        const v1Data = result[STORAGE_KEY];
        if (!v1Data) {
          console.log('No V1 data to backup.');
          resolve(true); // Nothing to backup
          return;
        }

        // Write backup
        chrome.storage.local.set({ [STORAGE_KEY_BACKUP_V1]: v1Data }, () => {
          if (chrome.runtime.lastError) {
            console.error('Backup failed:', chrome.runtime.lastError);
            resolve(false);
          } else {
            console.log('Backup v1 created successfully.');
            resolve(true);
          }
        });
      });
    } else {
      // LocalStorage Fallback
      const backup = localStorage.getItem(STORAGE_KEY_BACKUP_V1);
      if (backup) {
        resolve(true);
        return;
      }

      const v1Data = localStorage.getItem(STORAGE_KEY);
      if (v1Data) {
        localStorage.setItem(STORAGE_KEY_BACKUP_V1, v1Data);
        console.log('Backup v1 (localStorage) created.');
      }
      resolve(true);
    }
  });
};

/**
 * Saves V2 (Array) data to storage.
 * @param {Array} data - The new array-based leads structure.
 */
export const saveLeadsV2 = async (data) => {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ [STORAGE_KEY_V2]: data }, () => resolve());
    } else {
      localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(data));
      resolve();
    }
  });
};

/**
 * Loads V2 data. Performs migration from V1 if V2 is empty.
 * @returns {Promise<Array>} The V2 leads data.
 */
export const loadLeadsV2 = async () => {
  return new Promise((resolve) => {
    const checkV1AndMigrate = async () => {
      // 2. If no V2, check for V1
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get([STORAGE_KEY], async (res) => {
          const v1Raw = res[STORAGE_KEY];
          if (v1Raw && !Array.isArray(v1Raw)) {
            // FOUND V1 DATA
            console.log('Found V1 data, starting migration to V2...');
            await backupV1Data(); // SAFETY FIRST
            const v2Data = migrateV1toV2(v1Raw);
            await saveLeadsV2(v2Data);
            resolve(v2Data);
          } else {
            // No V1 or it's empty, return empty array
            resolve([]);
          }
        });
      } else {
        // LocalStorage Fallback
        const v1Raw = localStorage.getItem(STORAGE_KEY);
        if (v1Raw) {
          try {
            const parsed = JSON.parse(v1Raw);
            if (!Array.isArray(parsed)) {
              await backupV1Data();
              const v2Data = migrateV1toV2(parsed);
              await saveLeadsV2(v2Data);
              resolve(v2Data);
              return;
            }
          } catch (e) {
            console.error(e);
          }
        }
        resolve([]);
      }
    };

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get([STORAGE_KEY_V2], (result) => {
        if (result[STORAGE_KEY_V2]) {
          resolve(result[STORAGE_KEY_V2]);
        } else {
          checkV1AndMigrate();
        }
      });
    } else {
      const v2 = localStorage.getItem(STORAGE_KEY_V2);
      if (v2) {
        try {
          resolve(JSON.parse(v2));
        } catch (e) {
          resolve([]);
        }
      } else {
        checkV1AndMigrate();
      }
    }
  });
};
