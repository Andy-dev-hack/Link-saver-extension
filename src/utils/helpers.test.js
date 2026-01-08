import { describe, it, expect } from 'vitest';
import { truncateName, migrateData, getFaviconUrl } from './helpers';
import { TRUNCATE_LENGTH_LONG } from '@/constants';

describe('helpers.js', () => {
  describe('truncateName', () => {
    it('should return empty string for null/undefined', () => {
      expect(truncateName(null)).toBe('');
      expect(truncateName(undefined)).toBe('');
      expect(truncateName('')).toBe('');
    });

    it('should not truncate short names', () => {
      expect(truncateName('Short')).toBe('Short');
      expect(truncateName('Exactly 45 characters long name test here!')).toBe(
        'Exactly 45 characters long name test here!'
      );
    });

    it('should truncate names longer than default length (45)', () => {
      const longName = 'This is a very long name that exceeds the default truncate length';
      const result = truncateName(longName);
      expect(result).toBe('This is a very long name that exceeds the def...');
      expect(result.length).toBe(48); // 45 + '...'
    });

    it('should truncate names longer than custom length', () => {
      const longName =
        'This is a very long name that exceeds the custom truncate length of 70 characters';
      const result = truncateName(longName, TRUNCATE_LENGTH_LONG);
      expect(result).toBe('This is a very long name that exceeds the custom truncate le...');
      expect(result.length).toBe(63); // 60 + '...'
    });

    it('should respect custom maxLength parameter', () => {
      const result = truncateName('12345678901', 10);
      expect(result).toBe('1234567890...');
    });
  });

  describe('migrateData', () => {
    beforeEach(() => {
      // Mock crypto.randomUUID
      vi.spyOn(crypto, 'randomUUID').mockReturnValue('mock-uuid-123');
    });

    it('should convert array (old format) to object with "My Leads" folder', () => {
      const oldData = [
        { url: 'https://example.com', name: 'Example' },
        { url: 'https://test.com', name: 'Test' },
      ];

      const result = migrateData(oldData);

      expect(result).toHaveProperty('My Leads');
      expect(result['My Leads']).toHaveLength(2);
      expect(result['My Leads'][0].id).toBe('mock-uuid-123');
    });

    it('should add IDs to leads without IDs', () => {
      const data = {
        Work: [{ url: 'https://example.com', name: 'Example' }],
      };

      const result = migrateData(data);

      expect(result['Work'][0].id).toBe('mock-uuid-123');
    });

    it('should preserve existing IDs', () => {
      const data = {
        Work: [{ id: 'existing-id', url: 'https://example.com', name: 'Example' }],
      };

      const result = migrateData(data);

      expect(result['Work'][0].id).toBe('existing-id');
    });

    it('should convert string leads (legacy) to objects', () => {
      const data = {
        Work: ['https://example.com', 'https://test.com'],
      };

      const result = migrateData(data);

      expect(result['Work'][0]).toEqual({
        id: 'mock-uuid-123',
        url: 'https://example.com',
        name: 'https://example.com',
      });
      expect(result['Work']).toHaveLength(2);
    });

    it('should handle mixed format (strings and objects)', () => {
      const data = {
        Work: ['https://example.com', { url: 'https://test.com', name: 'Test' }],
      };

      const result = migrateData(data);

      expect(result['Work'][0].id).toBe('mock-uuid-123');
      expect(result['Work'][0].url).toBe('https://example.com');
      expect(result['Work'][1].id).toBe('mock-uuid-123');
      expect(result['Work'][1].url).toBe('https://test.com');
    });

    it('should handle empty object', () => {
      const result = migrateData({});
      expect(result).toEqual({});
    });

    it('should handle multiple folders', () => {
      const data = {
        Work: [{ url: 'https://work.com', name: 'Work' }],
        Personal: [{ url: 'https://personal.com', name: 'Personal' }],
      };

      const result = migrateData(data);

      expect(Object.keys(result)).toHaveLength(2);
      expect(result['Work'][0].id).toBe('mock-uuid-123');
      expect(result['Personal'][0].id).toBe('mock-uuid-123');
    });
  });

  describe('getFaviconUrl', () => {
    it('should return empty string for missing url', () => {
      expect(getFaviconUrl(null)).toBe('');
      expect(getFaviconUrl(undefined)).toBe('');
      expect(getFaviconUrl('')).toBe('');
    });

    it('should return correct favicon url for domain', () => {
      const url = 'https://www.github.com/some/repo';
      const expected = 'https://www.google.com/s2/favicons?domain=www.github.com&sz=32';
      expect(getFaviconUrl(url)).toBe(expected);
    });

    it('should handle url without www', () => {
      const url = 'https://github.com';
      const expected = 'https://www.google.com/s2/favicons?domain=github.com&sz=32';
      expect(getFaviconUrl(url)).toBe(expected);
    });

    it('should return empty string for invalid url', () => {
      expect(getFaviconUrl('not-a-url')).toBe('');
    });
  });
});
