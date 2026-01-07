import { describe, it, expect } from 'vitest';
import { isValidName, isDuplicateFolder } from './folderValidators';

describe('folderValidators', () => {
  describe('isValidName', () => {
    it('should return true for valid names', () => {
      expect(isValidName('My Folder')).toBe(true);
      expect(isValidName('  Trimmed  ')).toBe(true);
    });

    it('should return false for empty or whitespace-only strings', () => {
      expect(isValidName('')).toBe(false);
      expect(isValidName('   ')).toBe(false);
      expect(isValidName(null)).toBe(false);
      expect(isValidName(undefined)).toBe(false);
    });
  });

  describe('isDuplicateFolder', () => {
    const folders = [
      { id: '1', name: 'Work' },
      { id: '2', name: 'Personal' },
    ];

    it('should return true if folder name exists', () => {
      expect(isDuplicateFolder(folders, 'Work')).toBe(true);
      expect(isDuplicateFolder(folders, 'Personal')).toBe(true);
    });

    it('should return false if folder name does not exist', () => {
      expect(isDuplicateFolder(folders, 'New Folder')).toBe(false);
    });

    it('should return false if name is invalid', () => {
      expect(isDuplicateFolder(folders, '')).toBe(false);
    });
  });
});
