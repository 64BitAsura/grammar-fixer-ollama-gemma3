/**
 * Example: Using the Grammar Fixer API
 * 
 * This example demonstrates how to use the grammar fixer
 * programmatically in your Node.js applications.
 */

const { fixGrammar } = require('./src/grammarFixer');
const { applyCorrections } = require('./src/index');

// Example texts with various grammar errors
const examples = [
  {
    title: "Subject-verb agreement",
    text: "She dont like apples"
  },
  {
    title: "Verb conjugation",
    text: "He go to school everyday"
  },
  {
    title: "Plural subject with singular verb",
    text: "They was happy to see me"
  },
  {
    title: "Past tense error",
    text: "I seen that movie yesterday"
  },
  {
    title: "Pronoun usage",
    text: "Me and him went to the store"
  }
];

/**
 * Process a single example
 */
async function processExample(example) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Example: ${example.title}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Original text: "${example.text}"`);
  
  try {
    // Get grammar corrections
    const corrections = await fixGrammar(example.text);
    
    if (corrections.length === 0) {
      console.log('✓ No grammar errors found!\n');
      return;
    }
    
    console.log(`\nFound ${corrections.length} correction(s):\n`);
    
    // Display each correction
    corrections.forEach((correction, index) => {
      console.log(`${index + 1}. Position ${correction.location.start}-${correction.location.end}:`);
      console.log(`   Old: "${correction.oldText}"`);
      console.log(`   New: "${correction.newText}"`);
      if (correction.explanation) {
        console.log(`   Reason: ${correction.explanation}`);
      }
    });
    
    // Apply corrections to get the corrected text
    const correctedText = applyCorrections(example.text, corrections);
    console.log(`\nCorrected text: "${correctedText}"`);
    
    // Show JSON output
    console.log('\nJSON format:');
    console.log(JSON.stringify(corrections, null, 2));
    
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    
    if (error.message.includes('Unable to connect to Ollama')) {
      console.error('\nℹ️  Make sure Ollama is running:');
      console.error('   1. Start Ollama: ollama serve');
      console.error('   2. Pull Gemma3: ollama pull gemma3');
    }
  }
}

/**
 * Main function
 */
async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  Grammar Fixer - Ollama Gemma3 - API Examples             ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  // Process all examples
  for (const example of examples) {
    await processExample(example);
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('All examples completed!');
  console.log(`${'='.repeat(60)}\n`);
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  });
}

module.exports = { processExample, main };
