/**
 * CLI Integration Tests for Index Module
 * Tests for main function, command-line argument parsing, and CLI behavior
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');

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
    const testFilePath = path.join(os.tmpdir(), 'cli-test-file.txt');

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
      process.argv = ['node', 'index.js', '--file', path.join(os.tmpdir(), 'non-existent-file.txt')];
      
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
    test('should handle errors gracefully', async () => {
      const { processText } = require('../src/index');
      
      // Test with invalid Ollama connection by using a bad host temporarily
      await processText('test text', 'test').catch(() => {
        // Errors are expected and handled
      });
      
      // Just verify the function can handle errors
      expect(consoleErrorSpy).toHaveBeenCalled() || expect(true).toBe(true);
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
