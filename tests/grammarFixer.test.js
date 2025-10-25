/**
 * Tests for Grammar Fixer Module
 */

const { fixGrammar, isValidCorrection, findSubstringPosition } = require('../src/grammarFixer');

describe('Grammar Fixer', () => {
  describe('fixGrammar', () => {
    test('should throw error for invalid input (null)', async () => {
      await expect(fixGrammar(null)).rejects.toThrow('Invalid input: text must be a non-empty string');
    });

    test('should throw error for invalid input (undefined)', async () => {
      await expect(fixGrammar(undefined)).rejects.toThrow('Invalid input: text must be a non-empty string');
    });

    test('should throw error for invalid input (empty string)', async () => {
      await expect(fixGrammar('')).rejects.toThrow('Invalid input: text must be a non-empty string');
    });

    test('should throw error for invalid input (number)', async () => {
      await expect(fixGrammar(123)).rejects.toThrow('Invalid input: text must be a non-empty string');
    });

    test('should return an array for valid input', async () => {
      const result = await fixGrammar('This is a test sentence');
      expect(Array.isArray(result)).toBe(true);
    });

    test('should return array with correction objects (placeholder)', async () => {
      const result = await fixGrammar('She dont like apples');
      expect(Array.isArray(result)).toBe(true);
      // Note: In placeholder implementation, this returns empty array
      // When Ollama integration is complete, this should return actual corrections
    });
  });

  describe('isValidCorrection', () => {
    test('should return true for valid correction object', () => {
      const validCorrection = {
        location: { start: 0, end: 5 },
        oldText: 'dont',
        newText: "doesn't"
      };
      expect(isValidCorrection(validCorrection)).toBe(true);
    });

    test('should return false for correction missing location', () => {
      const invalidCorrection = {
        oldText: 'dont',
        newText: "doesn't"
      };
      expect(isValidCorrection(invalidCorrection)).toBe(false);
    });

    test('should return false for correction with invalid location.start', () => {
      const invalidCorrection = {
        location: { start: 'invalid', end: 5 },
        oldText: 'dont',
        newText: "doesn't"
      };
      expect(isValidCorrection(invalidCorrection)).toBe(false);
    });

    test('should return false for correction with invalid location.end', () => {
      const invalidCorrection = {
        location: { start: 0, end: 'invalid' },
        oldText: 'dont',
        newText: "doesn't"
      };
      expect(isValidCorrection(invalidCorrection)).toBe(false);
    });

    test('should return false for correction with non-string oldText', () => {
      const invalidCorrection = {
        location: { start: 0, end: 5 },
        oldText: 123,
        newText: "doesn't"
      };
      expect(isValidCorrection(invalidCorrection)).toBe(false);
    });

    test('should return false for correction with non-string newText', () => {
      const invalidCorrection = {
        location: { start: 0, end: 5 },
        oldText: 'dont',
        newText: 123
      };
      expect(isValidCorrection(invalidCorrection)).toBe(false);
    });

    test('should return false for null', () => {
      expect(isValidCorrection(null)).toBe(false);
    });

    test('should return false for undefined', () => {
      expect(isValidCorrection(undefined)).toBe(false);
    });
  });

  describe('findSubstringPosition', () => {
    test('should find substring at the beginning', () => {
      const result = findSubstringPosition('Hello world', 'Hello');
      expect(result).toEqual({ start: 0, end: 5 });
    });

    test('should find substring in the middle', () => {
      const result = findSubstringPosition('Hello world', 'world');
      expect(result).toEqual({ start: 6, end: 11 });
    });

    test('should find substring at the end', () => {
      const result = findSubstringPosition('Hello world', 'ld');
      expect(result).toEqual({ start: 9, end: 11 });
    });

    test('should return null for substring not found', () => {
      const result = findSubstringPosition('Hello world', 'xyz');
      expect(result).toBeNull();
    });

    test('should find substring starting from given index', () => {
      const result = findSubstringPosition('Hello world hello', 'hello', 6);
      expect(result).toEqual({ start: 12, end: 17 });
    });

    test('should handle empty substring', () => {
      const result = findSubstringPosition('Hello world', '');
      expect(result).toEqual({ start: 0, end: 0 });
    });
  });

  describe('Integration', () => {
    test('should handle multiple corrections in sequence', async () => {
      const texts = [
        'This is correct',
        'She dont like it',
        'He go to school'
      ];

      for (const text of texts) {
        const result = await fixGrammar(text);
        expect(Array.isArray(result)).toBe(true);
      }
    });
  });
});
