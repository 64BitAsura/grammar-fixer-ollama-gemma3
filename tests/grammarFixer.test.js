/**
 * Tests for Grammar Fixer Module
 */

const { fixGrammar, isValidCorrection, findSubstringPosition } = require('../src/grammarFixer');

// Mock the Ollama module
jest.mock('ollama', () => {
  return {
    Ollama: jest.fn().mockImplementation(() => {
      return {
        generate: jest.fn().mockImplementation(async ({ prompt }) => {
          // Simulate different responses based on the input text
          if (prompt.includes('She dont like apples')) {
            return {
              response: JSON.stringify([
                {
                  oldText: 'dont',
                  newText: "doesn't",
                  explanation: 'Incorrect contraction'
                }
              ])
            };
          } else if (prompt.includes('He go to school')) {
            return {
              response: JSON.stringify([
                {
                  oldText: 'go',
                  newText: 'goes',
                  explanation: 'Subject-verb agreement'
                }
              ])
            };
          } else if (prompt.includes('They was happy')) {
            return {
              response: JSON.stringify([
                {
                  oldText: 'was',
                  newText: 'were',
                  explanation: 'Plural subject requires plural verb'
                }
              ])
            };
          } else if (prompt.includes('connection error')) {
            const error = new Error('connect ECONNREFUSED');
            error.code = 'ECONNREFUSED';
            throw error;
          } else {
            // Return empty array for correct text
            return { response: '[]' };
          }
        })
      };
    })
  };
});

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
      expect(result.length).toBeGreaterThan(0);
      
      const correction = result[0];
      expect(correction).toHaveProperty('location');
      expect(correction).toHaveProperty('oldText');
      expect(correction).toHaveProperty('newText');
      expect(correction.oldText).toBe('dont');
      expect(correction.newText).toBe("doesn't");
    });

    test('should handle multiple grammar errors', async () => {
      const result = await fixGrammar('He go to school');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    test('should return empty array for grammatically correct text', async () => {
      const result = await fixGrammar('This is perfect grammar.');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    test('should calculate correct character positions', async () => {
      const result = await fixGrammar('She dont like apples');
      expect(result.length).toBeGreaterThan(0);
      
      const correction = result[0];
      expect(correction.location.start).toBe(4);
      expect(correction.location.end).toBe(8);
    });

    test('should include explanation when available', async () => {
      const result = await fixGrammar('She dont like apples');
      expect(result.length).toBeGreaterThan(0);
      
      const correction = result[0];
      expect(correction).toHaveProperty('explanation');
      expect(typeof correction.explanation).toBe('string');
    });

    test('should handle connection errors gracefully', async () => {
      await expect(fixGrammar('connection error')).rejects.toThrow(
        'Unable to connect to Ollama'
      );
    });

    test('should accept custom model option', async () => {
      const result = await fixGrammar('Test text', { model: 'custom-model' });
      expect(Array.isArray(result)).toBe(true);
    });

    test('should accept custom host option', async () => {
      const result = await fixGrammar('Test text', { host: 'http://custom:11434' });
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
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('location');
      expect(result[0]).toHaveProperty('oldText');
      expect(result[0]).toHaveProperty('newText');
    });

    test('should handle empty corrections array', async () => {
      const result = await fixGrammar('Perfect grammar here');
      expect(result).toEqual([]);
    });
  });
});
