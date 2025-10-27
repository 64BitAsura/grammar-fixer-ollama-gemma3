/**
 * Grammar Fixer Module
 * 
 * This module provides functionality to fix grammar in text using Ollama and Gemma3.
 * It returns structured JSON objects detailing each grammar change.
 */

const { Ollama } = require('ollama');

/**
 * Fixes grammar in the provided text using Ollama and Gemma3
 * 
 * @param {string} text - The text to analyze and correct
 * @param {Object} options - Optional configuration
 * @param {string} options.model - Model to use (default: 'gemma3')
 * @param {string} options.host - Ollama host (default: 'http://localhost:11434')
 * @returns {Promise<Array>} Array of correction objects with structure:
 *   {
 *     location: { start: number, end: number },
 *     oldText: string,
 *     newText: string
 *   }
 */
async function fixGrammar(text, options = {}) {
  if (!text || typeof text !== 'string') {
    throw new Error('Invalid input: text must be a non-empty string');
  }

  const config = {
    model: options.model || 'gemma3',
    host: options.host || 'http://localhost:11434'
  };
  
  try {
    // Call Ollama with Gemma3 to analyze the text
    const corrections = await analyzeTextWithOllama(text, config);
    
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
 * @param {Object} config - Configuration object
 * @returns {Promise<Array>} Raw corrections from Ollama
 */
async function analyzeTextWithOllama(text, config) {
  const ollama = new Ollama({ host: config.host });
  
  // Create a detailed prompt for grammar correction
  const prompt = `You are a grammar correction assistant. Analyze the following text and identify ALL grammar errors.

For each error, provide the response in STRICT JSON format as an array of objects. Each object must have:
- "oldText": the exact incorrect text from the original
- "newText": the corrected text
- "explanation": brief explanation of the error

Original text: "${text}"

Return ONLY the JSON array, nothing else. If there are no errors, return an empty array [].

Example format:
[
  {
    "oldText": "dont",
    "newText": "doesn't",
    "explanation": "Incorrect contraction"
  }
]`;

  try {
    const response = await ollama.generate({
      model: config.model,
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.3,
        top_p: 0.9
      }
    });

    return parseOllamaResponse(response.response, text);
  } catch (error) {
    // If Ollama is not available, throw a more descriptive error
    if (error.code === 'ECONNREFUSED' || 
        error.cause?.code === 'ECONNREFUSED' ||
        error.message?.includes('connect') ||
        error.message?.includes('fetch failed')) {
      throw new Error('Unable to connect to Ollama. Please ensure Ollama is running (ollama serve)');
    }
    throw error;
  }
}

/**
 * Parses the response from Ollama to extract corrections
 * 
 * @private
 * @param {string} responseText - The response text from Ollama
 * @param {string} originalText - The original text for validation
 * @returns {Array} Array of correction objects
 */
function parseOllamaResponse(responseText, originalText) {
  try {
    // Extract JSON from the response (it might have extra text)
    let jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.warn('No JSON array found in Ollama response, returning empty corrections');
      return [];
    }

    const corrections = JSON.parse(jsonMatch[0]);
    
    if (!Array.isArray(corrections)) {
      console.warn('Ollama response is not an array, returning empty corrections');
      return [];
    }

    // Validate and enrich corrections with position information
    return corrections.filter(correction => {
      return correction.oldText && 
             correction.newText && 
             typeof correction.oldText === 'string' &&
             typeof correction.newText === 'string';
    });
  } catch (error) {
    console.warn('Failed to parse Ollama response:', error.message);
    return [];
  }
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
  const formattedCorrections = [];
  let searchStartIndex = 0;
  
  for (const correction of rawCorrections) {
    // Find the position of the old text in the original
    const position = findSubstringPosition(originalText, correction.oldText, searchStartIndex);
    
    if (position) {
      const formattedCorrection = {
        location: {
          start: position.start,
          end: position.end
        },
        oldText: correction.oldText,
        newText: correction.newText
      };
      
      // Add explanation if available
      if (correction.explanation) {
        formattedCorrection.explanation = correction.explanation;
      }
      
      // Validate before adding
      if (isValidCorrection(formattedCorrection)) {
        formattedCorrections.push(formattedCorrection);
        // Move search index forward to handle multiple occurrences
        searchStartIndex = position.end;
      }
    } else {
      console.warn(`Could not find "${correction.oldText}" in original text`);
    }
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
    start,
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
