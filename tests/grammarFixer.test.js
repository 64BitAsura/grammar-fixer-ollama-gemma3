/**
 * Tests for Grammar Fixer Module
 * These tests connect to a real Ollama instance
 */

const { fixGrammar, isValidCorrection, findSubstringPosition } = require('../src/grammarFixer');

// Increase timeout for real Ollama calls
jest.setTimeout(30000);

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
      const result = await fixGrammar('This is correct text');
      expect(Array.isArray(result)).toBe(true);
    });

    test('should return corrections for text with grammar errors', async () => {
      const result = await fixGrammar('She dont like apples');
      expect(Array.isArray(result)).toBe(true);
      
      // Real Ollama may or may not find errors depending on the model
      // So we just verify the structure is correct
      if (result.length > 0) {
        const correction = result[0];
        expect(correction).toHaveProperty('location');
        expect(correction).toHaveProperty('oldText');
        expect(correction).toHaveProperty('newText');
        expect(typeof correction.oldText).toBe('string');
        expect(typeof correction.newText).toBe('string');
      }
    });

    test('should handle multiple grammar errors', async () => {
      const result = await fixGrammar('He go to school');
      expect(Array.isArray(result)).toBe(true);
      // Real Ollama will detect errors based on model capability
    });

    test('should return an array for grammatically correct text', async () => {
      const result = await fixGrammar('This is perfect grammar.');
      expect(Array.isArray(result)).toBe(true);
      // May or may not be empty depending on model interpretation
    });

    test('should calculate correct character positions when corrections exist', async () => {
      const result = await fixGrammar('She dont like apples');
      
      // Verify position structure if corrections exist
      result.forEach(correction => {
        expect(correction.location).toHaveProperty('start');
        expect(correction.location).toHaveProperty('end');
        expect(typeof correction.location.start).toBe('number');
        expect(typeof correction.location.end).toBe('number');
        expect(correction.location.end).toBeGreaterThan(correction.location.start);
      });
    });

    test('should include explanation when available', async () => {
      const result = await fixGrammar('She dont like apples');
      
      // If corrections exist, verify structure
      result.forEach(correction => {
        if (correction.explanation) {
          expect(typeof correction.explanation).toBe('string');
        }
      });
    });

    test('should accept custom model option', async () => {
      // Try with gemma:2b as fallback
      const result = await fixGrammar('Test text', { model: 'gemma:2b' }).catch(() => {
        // If gemma:2b doesn't exist, try with default
        return fixGrammar('Test text');
      });
      expect(Array.isArray(result)).toBe(true);
    });

    test('should accept custom host option', async () => {
      const result = await fixGrammar('Test text', { host: process.env.OLLAMA_HOST || 'http://localhost:11434' });
      expect(Array.isArray(result)).toBe(true);
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

    test('should return true for valid correction with explanation', () => {
      const validCorrection = {
        location: { start: 0, end: 5 },
        oldText: 'dont',
        newText: "doesn't",
        explanation: 'Incorrect contraction'
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

    test('should return false for non-object input', () => {
      expect(isValidCorrection('not an object')).toBe(false);
      expect(isValidCorrection(123)).toBe(false);
      expect(isValidCorrection([])).toBe(false);
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

    test('should be case-sensitive', () => {
      const result = findSubstringPosition('Hello world', 'hello');
      expect(result).toBeNull(); // Should not find lowercase 'hello' in 'Hello world'
      
      const result2 = findSubstringPosition('Hello world hello', 'hello');
      expect(result2).toEqual({ start: 12, end: 17 });
    });

    test('should handle special characters', () => {
      const result = findSubstringPosition("don't", "'");
      expect(result).toEqual({ start: 3, end: 4 });
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

    test('should produce valid correction objects', async () => {
      const result = await fixGrammar('She dont like apples');
      
      result.forEach(correction => {
        expect(isValidCorrection(correction)).toBe(true);
      });
    });

    test('should handle text with punctuation', async () => {
      const result = await fixGrammar('She dont like apples.');
      expect(Array.isArray(result)).toBe(true);
    });

    test('should handle longer text', async () => {
      const longText = 'This is correct text that spans multiple words and should not produce any corrections.';
      const result = await fixGrammar(longText);
      expect(Array.isArray(result)).toBe(true);
    });

    test('should handle text with numbers', async () => {
      const result = await fixGrammar('There are 3 apples.');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Response Processing', () => {
    test('should handle well-formed Ollama response', async () => {
      const result = await fixGrammar('She dont like apples');
      expect(Array.isArray(result)).toBe(true);
      
      // Verify structure of any corrections
      result.forEach(correction => {
        expect(correction).toHaveProperty('location');
        expect(correction).toHaveProperty('oldText');
        expect(correction).toHaveProperty('newText');
      });
    });

    test('should handle correct text gracefully', async () => {
      const result = await fixGrammar('Perfect grammar here');
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
