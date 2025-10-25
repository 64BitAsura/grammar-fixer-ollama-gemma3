/**
 * Grammar Fixer - Ollama Gemma3
 * 
 * Entry point for the grammar fixer application
 */

const { fixGrammar } = require('./grammarFixer');

/**
 * Main function to demonstrate the grammar fixer
 */
async function main() {
  console.log('Grammar Fixer - Ollama Gemma3\n');
  console.log('==============================\n');
  
  // Example texts with grammar errors
  const exampleTexts = [
    "She dont like apples",
    "He go to school everyday",
    "They was happy to see me"
  ];
  
  console.log('Analyzing sample texts for grammar errors...\n');
  
  for (const text of exampleTexts) {
    try {
      console.log(`Original text: "${text}"`);
      
      const corrections = await fixGrammar(text);
      
      if (corrections.length === 0) {
        console.log('No corrections found (or placeholder implementation active)\n');
      } else {
        console.log('Corrections:');
        console.log(JSON.stringify(corrections, null, 2));
        console.log('');
      }
    } catch (error) {
      console.error(`Error processing text: ${error.message}\n`);
    }
  }
  
  console.log('==============================');
  console.log('\nNote: This is a placeholder implementation.');
  console.log('To enable full functionality:');
  console.log('1. Ensure Ollama is running (ollama serve)');
  console.log('2. Pull the Gemma3 model (ollama pull gemma3)');
  console.log('3. Implement the Ollama integration in src/grammarFixer.js');
}

// Run the main function if this file is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { main };
