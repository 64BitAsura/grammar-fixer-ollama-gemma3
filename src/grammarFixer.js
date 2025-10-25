/**
 * Grammar Fixer Module
 * 
 * This module provides functionality to fix grammar in text using Ollama and Gemma3.
 * It returns structured JSON objects detailing each grammar change.
 */

// TODO: Import Ollama library when implementing
// const ollama = require('ollama');

/**
 * Fixes grammar in the provided text using Ollama and Gemma3
 * 
 * @param {string} text - The text to analyze and correct
 * @returns {Promise<Array>} Array of correction objects with structure:
 *   {
 *     location: { start: number, end: number },
 *     oldText: string,
 *     newText: string
 *   }
 */
async function fixGrammar(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('Invalid input: text must be a non-empty string');
  }

  // TODO: Implement actual Ollama integration
  // This is a placeholder implementation
  
  try {
    // Placeholder: In actual implementation, this will call Ollama with Gemma3
    const corrections = await analyzeTextWithOllama(text);
    
    // Process and format the corrections
    const formattedCorrections = processCorrections(text, corrections);
    
    return formattedCorrections;
  } catch (error) {
    console.error('Error fixing grammar:', error);
    throw error;
  }
}

/**
 * Analyzes text using Ollama and Gemma3 model
 * 
 * @private
 * @param {string} text - The text to analyze
 * @returns {Promise<Array>} Raw corrections from Ollama
 */
async function analyzeTextWithOllama(text) {
  // TODO: Implement Ollama API call
  // Example implementation structure:
  /*
  const response = await ollama.chat({
    model: 'gemma3',
    messages: [{
      role: 'user',
      content: `Fix the grammar in this text and provide changes in JSON format: "${text}"`
    }],
  });
  
  return parseOllamaResponse(response);
  */
  
  // Placeholder: Return empty array for now
  console.log('Analyzing text with Ollama/Gemma3 (placeholder):', text);
  return [];
}

/**
 * Processes raw corrections into the required format
 * 
 * @private
 * @param {string} originalText - The original text
 * @param {Array} rawCorrections - Raw corrections from Ollama
 * @returns {Array} Formatted correction objects
 */
function processCorrections(originalText, rawCorrections) {
  // TODO: Implement correction processing logic
  // This function should:
  // 1. Parse the corrections from Ollama's response
  // 2. Calculate exact character positions (start, end)
  // 3. Extract old and new text
  // 4. Return formatted array of correction objects
  
  const formattedCorrections = [];
  
  // Placeholder implementation
  for (const correction of rawCorrections) {
    formattedCorrections.push({
      location: {
        start: correction.start || 0,
        end: correction.end || 0
      },
      oldText: correction.oldText || '',
      newText: correction.newText || ''
    });
  }
  
  return formattedCorrections;
}

/**
 * Helper function to find the position of a substring in text
 * 
 * @private
 * @param {string} text - The text to search in
 * @param {string} substring - The substring to find
 * @param {number} startIndex - Starting index for search
 * @returns {Object} Object with start and end positions
 */
function findSubstringPosition(text, substring, startIndex = 0) {
  const start = text.indexOf(substring, startIndex);
  if (start === -1) {
    return null;
  }
  
  return {
    start: start,
    end: start + substring.length
  };
}

/**
 * Validates a correction object
 * 
 * @private
 * @param {Object} correction - The correction object to validate
 * @returns {boolean} True if valid, false otherwise
 */
function isValidCorrection(correction) {
  if (!correction || typeof correction !== 'object') {
    return false;
  }
  
  if (!correction.location || typeof correction.location !== 'object') {
    return false;
  }
  
  if (typeof correction.location.start !== 'number' || typeof correction.location.end !== 'number') {
    return false;
  }
  
  if (typeof correction.oldText !== 'string' || typeof correction.newText !== 'string') {
    return false;
  }
  
  return true;
}

module.exports = {
  fixGrammar,
  // Export helper functions for testing
  isValidCorrection,
  findSubstringPosition
};
