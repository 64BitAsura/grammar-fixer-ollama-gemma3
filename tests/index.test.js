/**
 * Tests for Index Module
 */

const { applyCorrections, readFromFile, processText } = require('../src/index');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

// Mock the fixGrammar function
jest.mock('../src/grammarFixer', () => {
  return {
    fixGrammar: jest.fn().mockImplementation(async (text) => {
      if (text.includes('dont')) {
        return [
          {
            location: { start: text.indexOf('dont'), end: text.indexOf('dont') + 4 },
            oldText: 'dont',
            newText: "doesn't",
            explanation: 'Incorrect contraction'
          }
        ];
      } else if (text.includes('go') && !text.includes('goes')) {
        return [
          {
            location: { start: text.indexOf('go'), end: text.indexOf('go') + 2 },
            oldText: 'go',
            newText: 'goes',
            explanation: 'Subject-verb agreement'
          }
        ];
      }
      return [];
    })
  };
});

describe('Index Module', () => {
  describe('applyCorrections', () => {
    test('should apply single correction', () => {
      const text = 'She dont like apples';
      const corrections = [
        {
          location: { start: 4, end: 8 },
          oldText: 'dont',
          newText: "doesn't"
        }
      ];
      
      const result = applyCorrections(text, corrections);
      expect(result).toBe("She doesn't like apples");
    });

    test('should apply multiple corrections', () => {
      const text = 'She dont like apples and he dont either';
      const corrections = [
        {
          location: { start: 4, end: 8 },
          oldText: 'dont',
          newText: "doesn't"
        },
        {
          location: { start: 28, end: 32 },
          oldText: 'dont',
          newText: "doesn't"
        }
      ];
      
      const result = applyCorrections(text, corrections);
      expect(result).toBe("She doesn't like apples and he doesn't either");
    });

    test('should handle empty corrections array', () => {
      const text = 'Perfect text';
      const corrections = [];
      
      const result = applyCorrections(text, corrections);
      expect(result).toBe('Perfect text');
    });

    test('should apply corrections in reverse order to maintain positions', () => {
      const text = 'He go to school and she dont care';
      const corrections = [
        {
          location: { start: 3, end: 5 },
          oldText: 'go',
          newText: 'goes'
        },
        {
          location: { start: 24, end: 28 },
          oldText: 'dont',
          newText: "doesn't"
        }
      ];
      
      const result = applyCorrections(text, corrections);
      expect(result).toBe("He goes to school and she doesn't care");
    });

    test('should handle adjacent corrections', () => {
      const text = 'abc def ghi';
      const corrections = [
        {
          location: { start: 0, end: 3 },
          oldText: 'abc',
          newText: 'ABC'
        },
        {
          location: { start: 4, end: 7 },
          oldText: 'def',
          newText: 'DEF'
        }
      ];
      
      const result = applyCorrections(text, corrections);
      expect(result).toBe('ABC DEF ghi');
    });

    test('should handle correction at the beginning', () => {
      const text = 'dont worry';
      const corrections = [
        {
          location: { start: 0, end: 4 },
          oldText: 'dont',
          newText: "don't"
        }
      ];
      
      const result = applyCorrections(text, corrections);
      expect(result).toBe("don't worry");
    });

    test('should handle correction at the end', () => {
      const text = 'I dont';
      const corrections = [
        {
          location: { start: 2, end: 6 },
          oldText: 'dont',
          newText: "don't"
        }
      ];
      
      const result = applyCorrections(text, corrections);
      expect(result).toBe("I don't");
    });

    test('should handle longer replacement text', () => {
      const text = 'He go';
      const corrections = [
        {
          location: { start: 3, end: 5 },
          oldText: 'go',
          newText: 'goes'
        }
      ];
      
      const result = applyCorrections(text, corrections);
      expect(result).toBe('He goes');
    });

    test('should handle shorter replacement text', () => {
      const text = 'I have went there';
      const corrections = [
        {
          location: { start: 7, end: 11 },
          oldText: 'went',
          newText: 'been'
        }
      ];
      
      const result = applyCorrections(text, corrections);
      expect(result).toBe('I have been there');
    });
  });

  describe('readFromFile', () => {
    // Create a temporary test file before tests
    const testFilePath = path.join(os.tmpdir(), 'test-grammar-file.txt');
    const testContent = 'This is test content for reading from file.';

    beforeAll(async () => {
      await fs.writeFile(testFilePath, testContent, 'utf-8');
    });

    afterAll(async () => {
      try {
        await fs.unlink(testFilePath);
      } catch (error) {
        // Ignore errors if file doesn't exist
      }
    });

    test('should read content from an existing file', async () => {
      const content = await readFromFile(testFilePath);
      expect(content).toBe(testContent);
    });

    test('should handle relative paths by resolving to absolute', async () => {
      // Write to a relative path in temp directory
      const relativeFile = 'test-relative.txt';
      const absolutePath = path.resolve(relativeFile);
      await fs.writeFile(absolutePath, 'relative content', 'utf-8');
      
      try {
        const content = await readFromFile(relativeFile);
        expect(content).toBe('relative content');
      } finally {
        await fs.unlink(absolutePath);
      }
    });

    test('should throw error for non-existent file', async () => {
      const nonExistentPath = path.join(os.tmpdir(), 'this-file-does-not-exist.txt');
      await expect(readFromFile(nonExistentPath)).rejects.toThrow('Failed to read file');
    });

    test('should throw error with descriptive message', async () => {
      const nonExistentPath = path.join(os.tmpdir(), 'non-existent-file.txt');
      await expect(readFromFile(nonExistentPath)).rejects.toThrow(
        /Failed to read file.*non-existent-file\.txt/
      );
    });

    test('should read multi-line content', async () => {
      const multiLineContent = 'Line 1\nLine 2\nLine 3';
      const multiLineFile = path.join(os.tmpdir(), 'multi-line-test.txt');
      await fs.writeFile(multiLineFile, multiLineContent, 'utf-8');
      
      try {
        const content = await readFromFile(multiLineFile);
        expect(content).toBe(multiLineContent);
      } finally {
        await fs.unlink(multiLineFile);
      }
    });

    test('should preserve special characters and encoding', async () => {
      const specialContent = 'Special chars: é, ñ, 中文, 😀';
      const specialFile = path.join(os.tmpdir(), 'special-chars-test.txt');
      await fs.writeFile(specialFile, specialContent, 'utf-8');
      
      try {
        const content = await readFromFile(specialFile);
        expect(content).toBe(specialContent);
      } finally {
        await fs.unlink(specialFile);
      }
    });
  });

  describe('processText', () => {
    let consoleLogSpy;

    beforeEach(() => {
      consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      consoleLogSpy.mockRestore();
    });

    test('should process text with grammar errors', async () => {
      await processText('She dont like apples', 'test');
      
      expect(consoleLogSpy).toHaveBeenCalled();
      // Check that it logged the original text
      expect(consoleLogSpy.mock.calls.some(call => 
        call.some(arg => typeof arg === 'string' && arg.includes('Original text'))
      )).toBe(true);
    });

    test('should display corrections when found', async () => {
      await processText('She dont like apples', 'test');
      
      // Check that corrections were displayed
      expect(consoleLogSpy.mock.calls.some(call => 
        call.some(arg => typeof arg === 'string' && arg.includes('correction'))
      )).toBe(true);
    });

    test('should display no errors message for correct text', async () => {
      await processText('This is correct text.', 'test');
      
      // Check for the success message
      expect(consoleLogSpy.mock.calls.some(call => 
        call.some(arg => typeof arg === 'string' && arg.includes('No grammar errors'))
      )).toBe(true);
    });

    test('should handle long text by truncating in display', async () => {
      const longText = 'a'.repeat(150);
      await processText(longText, 'test');
      
      // Should display text with ellipsis
      expect(consoleLogSpy.mock.calls.some(call => 
        call.some(arg => typeof arg === 'string' && arg.includes('...'))
      )).toBe(true);
    });

    test('should display corrected text when corrections exist', async () => {
      await processText('She dont like apples', 'test');
      
      // Should show the corrected text
      expect(consoleLogSpy.mock.calls.some(call => 
        call.some(arg => typeof arg === 'string' && arg.includes('Corrected text'))
      )).toBe(true);
    });

    test('should output JSON format for corrections', async () => {
      await processText('She dont like apples', 'test');
      
      // Should output JSON
      expect(consoleLogSpy.mock.calls.some(call => 
        call.some(arg => typeof arg === 'string' && arg.includes('JSON format'))
      )).toBe(true);
    });

    test('should handle errors gracefully', async () => {
      const { fixGrammar } = require('../src/grammarFixer');
      fixGrammar.mockRejectedValueOnce(new Error('Test error'));
      
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      await processText('Test text', 'test');
      
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });
});
