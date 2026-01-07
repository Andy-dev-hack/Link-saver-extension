import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import useLeadsV2 from './useLeadsV2';
import * as storageService from '@/services/storageService';

// Mock storageService methods
vi.mock('@/services/storageService', () => ({
  loadLeadsV2: vi.fn(),
  saveLeadsV2: vi.fn(),
}));

describe('useLeadsV2 Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock: return empty array
    storageService.loadLeadsV2.mockResolvedValue([]);
  });

  it('should initialize with empty data', async () => {
    const { result } = renderHook(() => useLeadsV2());
    await waitFor(() => {
      expect(result.current.leadsData).toEqual([]);
      expect(result.current.selectedFolderId).toBe('');
    });
  });

  it('should load data from V2 storage on mount', async () => {
    const mockData = [{ id: 'f1', name: 'Work', items: [] }];
    storageService.loadLeadsV2.mockResolvedValue(mockData);

    const { result } = renderHook(() => useLeadsV2());

    await waitFor(() => {
      expect(result.current.leadsData).toEqual(mockData);
      expect(result.current.selectedFolderId).toBe('f1');
    });
  });

  it('should add a new folder', async () => {
    // Mock crypto for deterministic ID
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('new-folder-id');

    const { result } = renderHook(() => useLeadsV2());
    await waitFor(() => expect(result.current.leadsData).toEqual([]));

    act(() => {
      result.current.addFolder('New Work');
    });

    expect(result.current.leadsData).toHaveLength(1);
    expect(result.current.leadsData[0]).toEqual({
      id: 'new-folder-id',
      name: 'New Work',
      items: [],
    });
    expect(result.current.selectedFolderId).toBe('new-folder-id');
  });

  it('should save a link to selected folder', async () => {
    vi.spyOn(crypto, 'randomUUID').mockReturnValueOnce('folder-id').mockReturnValueOnce('link-id');

    const { result } = renderHook(() => useLeadsV2());
    await waitFor(() => expect(result.current.leadsData).toEqual([]));

    act(() => {
      result.current.addFolder('Work');
    });

    act(() => {
      result.current.saveLink('https://google.com', 'Google');
    });

    expect(result.current.leadsData[0].items).toHaveLength(1);
    expect(result.current.leadsData[0].items[0].url).toBe('https://google.com');
  });

  it('should delete a folder', async () => {
    const startData = [{ id: 'f1', name: 'Work', items: [] }];
    storageService.loadLeadsV2.mockResolvedValue(startData);

    const { result } = renderHook(() => useLeadsV2());
    await waitFor(() => expect(result.current.selectedFolderId).toBe('f1'));

    act(() => {
      result.current.deleteFolder('f1');
    });

    expect(result.current.leadsData).toEqual([]);
    expect(result.current.selectedFolderId).toBe('');
  });
});
