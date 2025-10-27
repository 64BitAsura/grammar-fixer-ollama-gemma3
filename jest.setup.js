/**
 * Jest setup file for configuring tests
 * This file is executed before running tests
 */

// Set global timeout for tests that connect to real Ollama
jest.setTimeout(30000); // 30 seconds

// Log environment information
console.log('Test Environment Configuration:');
console.log('- OLLAMA_HOST:', process.env.OLLAMA_HOST || 'http://localhost:11434 (default)');
console.log('- OLLAMA_MODEL:', process.env.OLLAMA_MODEL || 'gemma3 (default)');
console.log('- Node version:', process.version);
