/**
 * CLI Integration Tests for Index Module
 * Tests for main function, command-line argument parsing, and CLI behavior
 */

const fs = require('fs').promises;
const path = require('path');

// Mock the fixGrammar function to avoid Ollama dependency
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
      } else if (text.includes('go to')) {
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

describe('CLI Integration Tests', () => {
  let consoleLogSpy;
  let consoleErrorSpy;
  let processExitSpy;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();
    jest.resetModules();
  });

  describe('main function - help option', () => {
    test('should display help with --help flag', async () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'index.js', '--help'];
      
      const { main } = require('../src/index');
      await main();
      
      expect(consoleLogSpy).toHaveBeenCalled();
      expect(consoleLogSpy.mock.calls.some(call => 
        call.some(arg => typeof arg === 'string' && arg.includes('Grammar Fixer'))
      )).toBe(true);
      expect(consoleLogSpy.mock.calls.some(call => 
        call.some(arg => typeof arg === 'string' && arg.includes('Usage'))
      )).toBe(true);
      
      process.argv = originalArgv;
    });

    test('should display help with -h flag', async () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'index.js', '-h'];
      
      const { main } = require('../src/index');
      await main();
      
      expect(consoleLogSpy).toHaveBeenCalled();
      expect(consoleLogSpy.mock.calls.some(call => 
        call.some(arg => typeof arg === 'string' && arg.includes('Usage'))
      )).toBe(true);
      
      process.argv = originalArgv;
    });
  });

  describe('main function - inline text', () => {
    test('should process inline text argument', async () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'index.js', 'She', 'dont', 'like', 'apples'];
      
      const { main } = require('../src/index');
      await main();
      
      expect(consoleLogSpy).toHaveBeenCalled();
      expect(consoleLogSpy.mock.calls.some(call => 
        call.some(arg => typeof arg === 'string' && arg.includes('Original text'))
      )).toBe(true);
      
      process.argv = originalArgv;
    });

    test('should process single word inline text', async () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'index.js', 'test'];
      
      const { main } = require('../src/index');
      await main();
      
      expect(consoleLogSpy).toHaveBeenCalled();
      process.argv = originalArgv;
    });
  });

  describe('main function - file input', () => {
    const testFilePath = path.join('/tmp', 'cli-test-file.txt');

    beforeEach(async () => {
      await fs.writeFile(testFilePath, 'She dont like apples', 'utf-8');
    });

    afterEach(async () => {
      try {
        await fs.unlink(testFilePath);
      } catch (error) {
        // Ignore if file doesn't exist
      }
    });

    test('should process file with --file flag', async () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'index.js', '--file', testFilePath];
      
      const { main } = require('../src/index');
      await main();
      
      expect(consoleLogSpy).toHaveBeenCalled();
      expect(consoleLogSpy.mock.calls.some(call => 
        call.some(arg => typeof arg === 'string' && arg.includes('Reading from file'))
      )).toBe(true);
      
      process.argv = originalArgv;
    });

    test('should process file with -f flag', async () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'index.js', '-f', testFilePath];
      
      const { main } = require('../src/index');
      await main();
      
      expect(consoleLogSpy).toHaveBeenCalled();
      process.argv = originalArgv;
    });

    test('should handle missing file path with --file', async () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'index.js', '--file'];
      
      const { main } = require('../src/index');
      await main();
      
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(processExitSpy).toHaveBeenCalledWith(1);
      
      process.argv = originalArgv;
    });

    test('should handle non-existent file', async () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'index.js', '--file', '/tmp/non-existent-file.txt'];
      
      const { main } = require('../src/index');
      await main();
      
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(processExitSpy).toHaveBeenCalledWith(1);
      
      process.argv = originalArgv;
    });
  });

  describe('main function - no arguments', () => {
    test('should run with example texts when no arguments provided', async () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'index.js'];
      
      const { main } = require('../src/index');
      await main();
      
      expect(consoleLogSpy).toHaveBeenCalled();
      expect(consoleLogSpy.mock.calls.some(call => 
        call.some(arg => typeof arg === 'string' && arg.includes('No input provided'))
      )).toBe(true);
      expect(consoleLogSpy.mock.calls.some(call => 
        call.some(arg => typeof arg === 'string' && arg.includes('example'))
      )).toBe(true);
      
      process.argv = originalArgv;
    });

    test('should display usage information when no arguments', async () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'index.js'];
      
      const { main } = require('../src/index');
      await main();
      
      expect(consoleLogSpy.mock.calls.some(call => 
        call.some(arg => typeof arg === 'string' && arg.includes('Usage'))
      )).toBe(true);
      
      process.argv = originalArgv;
    });
  });

  describe('processText edge cases', () => {
    test('should handle Ollama connection errors', async () => {
      const { fixGrammar } = require('../src/grammarFixer');
      fixGrammar.mockRejectedValueOnce(new Error('Unable to connect to Ollama'));
      
      const { processText } = require('../src/index');
      await processText('test text', 'test');
      
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(consoleErrorSpy.mock.calls.some(call => 
        call.some(arg => typeof arg === 'string' && arg.includes('Ollama'))
      )).toBe(true);
    });

    test('should handle generic errors', async () => {
      const { fixGrammar } = require('../src/grammarFixer');
      fixGrammar.mockRejectedValueOnce(new Error('Generic error'));
      
      const { processText } = require('../src/index');
      await processText('test text', 'test');
      
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('Integration scenarios', () => {
    test('should complete full workflow for text with errors', async () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'index.js', 'She', 'dont', 'like', 'apples'];
      
      const { main } = require('../src/index');
      await main();
      
      // Should show original text
      expect(consoleLogSpy.mock.calls.some(call => 
        call.some(arg => typeof arg === 'string' && arg.includes('Original text'))
      )).toBe(true);
      
      // Should show corrections found
      expect(consoleLogSpy.mock.calls.some(call => 
        call.some(arg => typeof arg === 'string' && arg.includes('correction'))
      )).toBe(true);
      
      // Should show corrected text
      expect(consoleLogSpy.mock.calls.some(call => 
        call.some(arg => typeof arg === 'string' && arg.includes('Corrected text'))
      )).toBe(true);
      
      // Should output JSON
      expect(consoleLogSpy.mock.calls.some(call => 
        call.some(arg => typeof arg === 'string' && arg.includes('JSON'))
      )).toBe(true);
      
      process.argv = originalArgv;
    });

    test('should display requirements note at the end', async () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'index.js', 'test'];
      
      const { main } = require('../src/index');
      await main();
      
      expect(consoleLogSpy.mock.calls.some(call => 
        call.some(arg => typeof arg === 'string' && arg.includes('Ollama'))
      )).toBe(true);
      
      process.argv = originalArgv;
    });
  });
});
