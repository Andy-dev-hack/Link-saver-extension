import { describe, it, expect, vi, beforeEach } from 'vitest';
import { migrateV1toV2 } from './migrationAdapter';

describe('migrateV1toV2', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should migrate legacy object format to array format with UUIDs', () => {
    // Mock crypto.randomUUID to get deterministic IDs
    vi.spyOn(crypto, 'randomUUID')
      .mockReturnValueOnce('folder-uuid-1')
      .mockReturnValueOnce('folder-uuid-2');

    const input = {
      Work: [{ id: 'lead-1', url: 'https://work.com', name: 'Work Link' }],
      Personal: [{ id: 'lead-2', url: 'https://fun.com', name: 'Fun Link' }],
    };

    const result = migrateV1toV2(input);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: 'folder-uuid-1',
      name: 'Work',
      items: [{ id: 'lead-1', url: 'https://work.com', name: 'Work Link' }],
    });
    expect(result[1]).toEqual({
      id: 'folder-uuid-2',
      name: 'Personal',
      items: [{ id: 'lead-2', url: 'https://fun.com', name: 'Fun Link' }],
    });
  });

  it('should return empty array for empty input', () => {
    const result = migrateV1toV2({});
    expect(result).toEqual([]);
  });

  it('should not migrate if input already looks like V2 (idempotency check)', () => {
    // NOTE: We need to define strictly what "looks like V2" means.
    // For now, if input is Array, we assume it's V2.
    const v2Input = [{ id: 'f1', name: 'F1', items: [] }];
    const result = migrateV1toV2(v2Input);
    expect(result).toEqual(v2Input);
  });
});
