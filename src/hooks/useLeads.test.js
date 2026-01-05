import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useLeads } from '@/hooks';

describe('useLeads Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    // Mock chrome.storage.local
    global.chrome = {
      storage: {
        local: {
          get: vi.fn((keys, callback) => callback({})),
          set: vi.fn(),
        },
      },
      runtime: {},
    };
  });

  describe('Initialization', () => {
    it('should initialize with empty data', async () => {
      const { result } = renderHook(() => useLeads());

      await waitFor(() => {
        expect(result.current.leadsData).toEqual({});
        expect(result.current.selectedFolder).toBe('');
      });
    });

    it('should load data from chrome.storage.local on mount', async () => {
      const mockData = {
        Work: [{ id: '1', url: 'https://example.com', name: 'Example' }],
      };

      global.chrome.storage.local.get = vi.fn((keys, callback) => {
        callback({ myLeadsByFolder: mockData });
      });

      const { result } = renderHook(() => useLeads());

      await waitFor(() => {
        expect(result.current.leadsData).toEqual(mockData);
        expect(result.current.selectedFolder).toBe('Work');
      });
    });
  });

  describe('Folder Operations', () => {
    it('should add a new folder', async () => {
      const { result } = renderHook(() => useLeads());

      await waitFor(() => expect(result.current.leadsData).toEqual({}));

      act(() => {
        result.current.addFolder('Work');
      });

      expect(result.current.leadsData).toHaveProperty('Work');
      expect(result.current.selectedFolder).toBe('Work');
    });

    it('should not add duplicate folder', async () => {
      const { result } = renderHook(() => useLeads());
      window.alert = vi.fn();

      await waitFor(() => expect(result.current.leadsData).toEqual({}));

      act(() => {
        result.current.addFolder('Work');
      });

      act(() => {
        result.current.addFolder('Work');
      });

      expect(window.alert).toHaveBeenCalledWith('Folder "Work" already exists.');
    });

    it('should delete a folder', async () => {
      const { result } = renderHook(() => useLeads());
      window.confirm = vi.fn(() => true);

      await waitFor(() => expect(result.current.leadsData).toEqual({}));

      act(() => {
        result.current.addFolder('Work');
      });

      act(() => {
        result.current.deleteFolder('Work');
      });

      expect(result.current.leadsData).not.toHaveProperty('Work');
      expect(result.current.selectedFolder).toBe('');
    });

    it('should rename a folder', async () => {
      const { result } = renderHook(() => useLeads());

      await waitFor(() => expect(result.current.leadsData).toEqual({}));

      act(() => {
        result.current.addFolder('Work');
      });

      act(() => {
        result.current.renameFolder('Work', 'Personal');
      });

      expect(result.current.leadsData).toHaveProperty('Personal');
      expect(result.current.leadsData).not.toHaveProperty('Work');
      expect(result.current.selectedFolder).toBe('Personal');
    });
  });

  describe('Lead Operations', () => {
    it('should save a link to selected folder', async () => {
      const { result } = renderHook(() => useLeads());
      vi.spyOn(window, 'prompt').mockReturnValue('My Link');

      await waitFor(() => expect(result.current.leadsData).toEqual({}));

      act(() => {
        result.current.addFolder('Work');
      });

      act(() => {
        result.current.saveLink('https://example.com');
      });

      expect(result.current.leadsData['Work']).toHaveLength(1);
      expect(result.current.leadsData['Work'][0].url).toBe('https://example.com');
      expect(result.current.leadsData['Work'][0].name).toBe('My Link');
    });

    it('should delete a lead', async () => {
      const { result } = renderHook(() => useLeads());
      vi.spyOn(window, 'prompt').mockReturnValue('My Link');
      window.confirm = vi.fn(() => true);

      await waitFor(() => expect(result.current.leadsData).toEqual({}));

      act(() => {
        result.current.addFolder('Work');
      });

      act(() => {
        result.current.saveLink('https://example.com');
      });

      act(() => {
        result.current.deleteLead('Work', 0);
      });

      // When last lead is deleted, folder is also deleted
      expect(result.current.leadsData).not.toHaveProperty('Work');
    });

    it('should edit a lead name', async () => {
      const { result } = renderHook(() => useLeads());
      vi.spyOn(window, 'prompt').mockReturnValue('My Link');

      await waitFor(() => expect(result.current.leadsData).toEqual({}));

      act(() => {
        result.current.addFolder('Work');
      });

      act(() => {
        result.current.saveLink('https://example.com');
      });

      act(() => {
        result.current.editLead('Work', 0, 'Updated Link');
      });

      expect(result.current.leadsData['Work'][0].name).toBe('Updated Link');
    });
  });

  describe('Drag and Drop Operations', () => {
    it('should reorder leads within a folder', async () => {
      const { result } = renderHook(() => useLeads());
      vi.spyOn(window, 'prompt').mockReturnValueOnce('Link 1').mockReturnValueOnce('Link 2');

      await waitFor(() => expect(result.current.leadsData).toEqual({}));

      act(() => {
        result.current.addFolder('Work');
      });

      act(() => {
        result.current.saveLink('https://example1.com');
      });

      act(() => {
        result.current.saveLink('https://example2.com');
      });

      act(() => {
        result.current.reorderLeads('Work', 0, 1);
      });

      expect(result.current.leadsData['Work'][0].name).toBe('Link 2');
      expect(result.current.leadsData['Work'][1].name).toBe('Link 1');
    });

    it('should move lead between folders', async () => {
      const { result } = renderHook(() => useLeads());
      vi.spyOn(window, 'prompt').mockReturnValue('My Link');
      vi.spyOn(crypto, 'randomUUID').mockReturnValue('test-id');

      await waitFor(() => expect(result.current.leadsData).toEqual({}));

      act(() => {
        result.current.addFolder('Work');
      });

      act(() => {
        result.current.addFolder('Personal');
      });

      act(() => {
        result.current.setSelectedFolder('Work');
      });

      act(() => {
        result.current.saveLink('https://example.com');
      });

      const leadId = result.current.leadsData['Work'][0].id;

      act(() => {
        result.current.moveLead(leadId, 'Personal');
      });

      expect(result.current.leadsData['Work']).toHaveLength(0);
      expect(result.current.leadsData['Personal']).toHaveLength(1);
    });
  });

  describe('Import Tabs', () => {
    it('should import multiple tabs into a folder', async () => {
      const { result } = renderHook(() => useLeads());
      const mockTabs = [
        { url: 'https://example1.com', title: 'Example 1' },
        { url: 'https://example2.com', title: 'Example 2' },
      ];

      await waitFor(() => expect(result.current.leadsData).toEqual({}));

      act(() => {
        result.current.importTabs(mockTabs, 'Imported');
      });

      expect(result.current.leadsData['Imported']).toHaveLength(2);
      expect(result.current.leadsData['Imported'][0].url).toBe('https://example1.com');
      expect(result.current.leadsData['Imported'][1].url).toBe('https://example2.com');
    });
  });
});
