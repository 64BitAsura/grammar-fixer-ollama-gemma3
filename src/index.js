/**
 * Grammar Fixer - Ollama Gemma3
 * 
 * Entry point for the grammar fixer application
 */

const { fixGrammar } = require('./grammarFixer');
const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

/**
 * Reads text from stdin
 * @returns {Promise<string>} The text from stdin
 */
async function readFromStdin() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const lines = [];
  
  return new Promise((resolve) => {
    rl.on('line', (line) => {
      lines.push(line);
    });
    
    rl.on('close', () => {
      resolve(lines.join('\n'));
    });
  });
}

/**
 * Reads text from a file
 * @param {string} filePath - Path to the file
 * @returns {Promise<string>} The text from the file
 */
async function readFromFile(filePath) {
  try {
    const absolutePath = path.resolve(filePath);
    const content = await fs.readFile(absolutePath, 'utf-8');
    return content;
  } catch (error) {
    throw new Error(`Failed to read file "${filePath}": ${error.message}`);
  }
}

/**
 * Applies corrections to text and returns the corrected version
 * @param {string} text - Original text
 * @param {Array} corrections - Array of correction objects
 * @returns {string} Corrected text
 */
function applyCorrections(text, corrections) {
  if (corrections.length === 0) {
    return text;
  }

  // Sort corrections by start position in reverse to apply from end to start
  const sortedCorrections = [...corrections].sort((a, b) => b.location.start - a.location.start);
  
  let correctedText = text;
  for (const correction of sortedCorrections) {
    correctedText = 
      correctedText.substring(0, correction.location.start) +
      correction.newText +
      correctedText.substring(correction.location.end);
  }
  
  return correctedText;
}

/**
 * Main function to demonstrate the grammar fixer
 */
async function main() {
  const args = process.argv.slice(2);
  
  console.log('Grammar Fixer - Ollama Gemma3\n');
  console.log('==============================\n');
  
  let inputText = null;
  let inputSource = 'examples';
  
  try {
    // Check for command line arguments
    if (args.length > 0) {
      const firstArg = args[0];
      
      if (firstArg === '--help' || firstArg === '-h') {
        printHelp();
        return;
      } else if (firstArg === '--stdin' || firstArg === '-') {
        console.log('Reading from stdin (press Ctrl+D when done):\n');
        inputText = await readFromStdin();
        inputSource = 'stdin';
      } else if (firstArg === '--file' || firstArg === '-f') {
        if (args.length < 2) {
          console.error('Error: --file requires a file path argument');
          process.exit(1);
        }
        const filePath = args[1];
        console.log(`Reading from file: ${filePath}\n`);
        inputText = await readFromFile(filePath);
        inputSource = 'file';
      } else {
        // Treat first argument as inline text
        inputText = args.join(' ');
        inputSource = 'argument';
      }
    }
    
    // If no input provided, use example texts
    if (!inputText) {
      const exampleTexts = [
        "She dont like apples",
        "He go to school everyday",
        "They was happy to see me"
      ];
      
      console.log('No input provided. Running with example texts...\n');
      console.log('Usage: npm start -- [options] [text]');
      console.log('  Options:');
      console.log('    --help, -h           Show help');
      console.log('    --stdin, -           Read from stdin');
      console.log('    --file, -f <path>    Read from file');
      console.log('    [text]               Process inline text\n');
      
      for (const text of exampleTexts) {
        await processText(text, 'example');
      }
    } else {
      await processText(inputText, inputSource);
    }
    
    console.log('==============================');
    console.log('\nNote: This application requires Ollama with Gemma3.');
    console.log('If you encounter connection errors:');
    console.log('1. Ensure Ollama is running (ollama serve)');
    console.log('2. Pull the Gemma3 model (ollama pull gemma3)');
  } catch (error) {
    console.error('\nError:', error.message);
    process.exit(1);
  }
}

/**
 * Processes a single text input
 * @param {string} text - The text to process
 * @param {string} source - The source of the text
 */
async function processText(text, source) {
  try {
    console.log(`\nOriginal text: "${text.substring(0, 100)}${text.length > 100 ? '...' : ''}"`);
    
    const corrections = await fixGrammar(text);
    
    if (corrections.length === 0) {
      console.log('✓ No grammar errors found!\n');
    } else {
      console.log(`\nFound ${corrections.length} correction(s):\n`);
      
      corrections.forEach((correction, index) => {
        console.log(`${index + 1}. Position ${correction.location.start}-${correction.location.end}:`);
        console.log(`   Old: "${correction.oldText}"`);
        console.log(`   New: "${correction.newText}"`);
        if (correction.explanation) {
          console.log(`   Reason: ${correction.explanation}`);
        }
        console.log();
      });
      
      const correctedText = applyCorrections(text, corrections);
      console.log(`Corrected text: "${correctedText}"`);
      
      // Output JSON format
      console.log('\nJSON format:');
      console.log(JSON.stringify(corrections, null, 2));
    }
  } catch (error) {
    console.error(`Error processing text: ${error.message}`);
    if (error.message.includes('Unable to connect to Ollama')) {
      console.error('\nPlease ensure:');
      console.error('1. Ollama is installed and running (ollama serve)');
      console.error('2. The Gemma3 model is available (ollama pull gemma3)');
    }
  }
}

/**
 * Prints help information
 */
function printHelp() {
  console.log('Grammar Fixer - Ollama Gemma3');
  console.log('\nUsage:');
  console.log('  npm start                              Run with example texts');
  console.log('  npm start -- "text to check"           Check inline text');
  console.log('  npm start -- --stdin                   Read from stdin');
  console.log('  npm start -- --file path/to/file.txt   Read from file');
  console.log('\nOptions:');
  console.log('  --help, -h           Show this help message');
  console.log('  --stdin, -           Read text from stdin');
  console.log('  --file, -f <path>    Read text from file');
  console.log('\nExamples:');
  console.log('  npm start -- "She dont like apples"');
  console.log('  echo "He go to school" | npm start -- --stdin');
  console.log('  npm start -- --file data/sample-inputs.json');
  console.log('\nRequirements:');
  console.log('  - Ollama must be running (ollama serve)');
  console.log('  - Gemma3 model must be installed (ollama pull gemma3)');
}

// Run the main function if this file is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { 
  main, 
  readFromFile, 
  readFromStdin, 
  applyCorrections,
  processText 
};
