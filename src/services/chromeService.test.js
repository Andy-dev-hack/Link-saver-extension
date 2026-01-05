import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getActiveTab, getAllTabs } from '@/services';

describe('chromeService.js', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getActiveTab', () => {
    it('should call callback with active tab URL and title', () => {
      const mockTabs = [
        {
          url: 'https://example.com',
          title: 'Example Site',
        },
      ];

      // Mock chrome.tabs.query
      global.chrome = {
        tabs: {
          query: vi.fn((query, callback) => {
            callback(mockTabs);
          }),
        },
      };

      const callback = vi.fn();
      getActiveTab(callback);

      expect(chrome.tabs.query).toHaveBeenCalledWith(
        { active: true, currentWindow: true },
        expect.any(Function)
      );
      expect(callback).toHaveBeenCalledWith('https://example.com', 'Example Site');
    });

    it('should use URL as title if title is missing', () => {
      const mockTabs = [
        {
          url: 'https://example.com',
          title: '',
        },
      ];

      global.chrome = {
        tabs: {
          query: vi.fn((query, callback) => {
            callback(mockTabs);
          }),
        },
      };

      const callback = vi.fn();
      getActiveTab(callback);

      expect(callback).toHaveBeenCalledWith('https://example.com', 'https://example.com');
    });

    it('should handle empty tabs array', () => {
      global.chrome = {
        tabs: {
          query: vi.fn((query, callback) => {
            callback([]);
          }),
        },
      };

      const callback = vi.fn();
      getActiveTab(callback);

      expect(callback).not.toHaveBeenCalled();
    });

    it('should warn if Chrome API is unavailable', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      global.chrome = undefined;

      const callback = vi.fn();
      getActiveTab(callback);

      expect(consoleWarnSpy).toHaveBeenCalledWith('Chrome API not available (getActiveTab)');
      expect(callback).not.toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });
  });

  describe('getAllTabs', () => {
    it('should call callback with all tabs in current window', () => {
      const mockTabs = [
        { url: 'https://example.com', title: 'Example' },
        { url: 'https://test.com', title: 'Test' },
      ];

      global.chrome = {
        tabs: {
          query: vi.fn((query, callback) => {
            callback(mockTabs);
          }),
        },
      };

      const callback = vi.fn();
      getAllTabs(callback);

      expect(chrome.tabs.query).toHaveBeenCalledWith({ currentWindow: true }, expect.any(Function));
      expect(callback).toHaveBeenCalledWith(mockTabs);
    });

    it('should provide mock data when Chrome API is unavailable', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      global.chrome = undefined;

      const callback = vi.fn();
      getAllTabs(callback);

      expect(consoleWarnSpy).toHaveBeenCalledWith('Chrome API not available (getAllTabs)');
      expect(callback).toHaveBeenCalledWith([
        { url: 'https://google.com', title: 'Google' },
        { url: 'https://github.com', title: 'GitHub' },
      ]);

      consoleWarnSpy.mockRestore();
    });

    it('should handle empty tabs array', () => {
      global.chrome = {
        tabs: {
          query: vi.fn((query, callback) => {
            callback([]);
          }),
        },
      };

      const callback = vi.fn();
      getAllTabs(callback);

      expect(callback).toHaveBeenCalledWith([]);
    });
  });
});
