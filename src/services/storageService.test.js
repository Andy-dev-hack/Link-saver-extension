import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadLeadsFromStorage, saveLeadsToStorage } from './storageService';
import { STORAGE_KEY_V1 as STORAGE_KEY } from '@/constants';

describe('storageService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.chrome = {
      storage: {
        local: {
          get: vi.fn(),
          set: vi.fn(),
        },
      },
      runtime: {
        lastError: null,
      },
    };
    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
    };
  });

  afterEach(() => {
    delete global.chrome;
    delete global.localStorage;
  });

  describe('loadLeadsFromStorage', () => {
    it('should load data from chrome.storage.local', async () => {
      const mockData = { folder1: [] };
      global.chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({ [STORAGE_KEY]: mockData });
      });

      const result = await loadLeadsFromStorage();
      expect(result).toEqual(mockData);
      expect(chrome.storage.local.get).toHaveBeenCalledWith([STORAGE_KEY], expect.any(Function));
    });

    it('should parse stringified data from chrome.storage.local', async () => {
      const mockData = { folder1: [] };
      global.chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({ [STORAGE_KEY]: JSON.stringify(mockData) });
      });

      const result = await loadLeadsFromStorage();
      expect(result).toEqual(mockData);
    });

    it('should migrate from localStorage if chrome storage is empty', async () => {
      const mockData = { folder1: [] };
      global.chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({}); // Empty chrome storage
      });
      global.localStorage.getItem.mockReturnValue(JSON.stringify(mockData));

      const result = await loadLeadsFromStorage();
      expect(result).toEqual(mockData);
      expect(chrome.storage.local.set).toHaveBeenCalledWith({ [STORAGE_KEY]: mockData });
    });

    it('should return empty object if no data anywhere', async () => {
      global.chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({});
      });
      global.localStorage.getItem.mockReturnValue(null);

      const result = await loadLeadsFromStorage();
      expect(result).toEqual({});
    });

    it('should use localStorage fallback if chrome is undefined', async () => {
      delete global.chrome; // Simulate dev environment
      const mockData = { folder1: [] };
      global.localStorage = {
        getItem: vi.fn().mockReturnValue(JSON.stringify(mockData)),
        setItem: vi.fn(),
      };

      const result = await loadLeadsFromStorage();
      expect(result).toEqual(mockData);
    });
  });

  describe('saveLeadsToStorage', () => {
    it('should save to chrome.storage.local', async () => {
      const mockData = { folder1: [] };
      global.chrome.storage.local.set.mockImplementation((items, callback) => {
        callback();
      });

      await saveLeadsToStorage(mockData);
      expect(chrome.storage.local.set).toHaveBeenCalledWith(
        { [STORAGE_KEY]: mockData },
        expect.any(Function)
      );
    });

    it('should save to localStorage if chrome is undefined', async () => {
      delete global.chrome;
      const mockData = { folder1: [] };

      // Need to re-mock localStorage here because afterEach deletes it but the global.localStorage assignment in beforeEach might not persist through the 'delete global.chrome' override if I'm not careful?
      // Actually delete global.chrome is fine, localStorage is separate.
      global.localStorage = {
        getItem: vi.fn(),
        setItem: vi.fn(),
      };

      await saveLeadsToStorage(mockData);
      expect(localStorage.setItem).toHaveBeenCalledWith(STORAGE_KEY, JSON.stringify(mockData));
    });
  });

  describe('loadLeadsV2 (Migration Logic)', () => {
    it('should migrate from localStorage if chrome storage is empty (V2 flow)', async () => {
      // Setup: Empty V2, Empty V1 Chrome, But Data in LocalStorage
      const mockLegacyData = { folder1: [] };
      global.chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({}); // Chrome empty
      });
      global.localStorage.getItem.mockReturnValue(JSON.stringify(mockLegacyData));

      // We need to mock backupV1Data and saveLeadsV2 logic if not mocked by module
      // But here we are unit testing storageService, so we rely on its internal calls.
      // We need to verify storage.set is called for V2
      global.chrome.storage.local.set.mockImplementation((items, cb) => cb && cb());

      const { loadLeadsV2 } = await import('./storageService');
      const result = await loadLeadsV2();

      // Should be array now (migrated)
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1); // folder1
      expect(result[0].name).toBe('folder1');
      // Should have saved to V2
      expect(chrome.storage.local.set).toHaveBeenCalledWith(
        expect.objectContaining({ myLeadsV2: expect.any(Array) }),
        expect.any(Function)
      );
    });

    it('should accept Array data in V1 key (V2 ghost data)', async () => {
      const ghostData = [{ id: '123', name: 'Ghost', items: [] }];
      global.chrome.storage.local.get.mockImplementation((keys, callback) => {
        // If asking for V2, return empty
        if (keys.includes('myLeadsV2')) {
          callback({});
          return;
        }
        // If asking for V1, return Array
        if (keys.includes('myLeads')) {
          callback({ myLeads: ghostData });
        }
      });
      global.chrome.storage.local.set.mockImplementation((items, cb) => cb && cb());

      const { loadLeadsV2 } = await import('./storageService');
      const result = await loadLeadsV2();

      expect(result).toEqual(ghostData);
      // Should have moved to V2 key
      expect(chrome.storage.local.set).toHaveBeenCalledWith(
        { myLeadsV2: ghostData },
        expect.any(Function)
      );
    });
  });
});
