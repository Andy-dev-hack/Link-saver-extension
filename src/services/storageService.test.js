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
});
