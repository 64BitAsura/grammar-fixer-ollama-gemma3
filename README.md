# Grammar Fixer - Ollama Gemma3

A Node.js application that uses Ollama with the Gemma3 model to fix grammar in text. The application returns structured JSON objects for each grammar change, detailing the location, original text, and corrected text.

## Features

- Fix grammar errors in text using Ollama and Gemma3
- Returns JSON objects with detailed change information:
  - Location of the change (start/end positions)
  - Original characters (old text)
  - Corrected characters (new text)
- Easy-to-use API for grammar correction

## Prerequisites

Before running this project, make sure you have:

- **Node.js** (v16 or higher) installed
- **Ollama** installed and running on your system
- **Gemma3 model** pulled in Ollama (`ollama pull gemma3`)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/64BitAsura/grammar-fixer-ollama-gemma3.git
cd grammar-fixer-ollama-gemma3
```

2. Install dependencies:
```bash
npm install
```

3. Ensure Ollama is running:
```bash
ollama serve
```

4. Pull the Gemma3 model (if not already done):
```bash
ollama pull gemma3
```

## Usage

### Running the Application

Run with example texts:
```bash
npm start
```

Process inline text:
```bash
npm start -- "She dont like apples"
```

Read from stdin:
```bash
echo "He go to school everyday" | npm start -- --stdin
```

Read from a file:
```bash
npm start -- --file path/to/your/file.txt
```

### Command Line Options

- `--help, -h`: Display help information
- `--stdin, -`: Read text from standard input
- `--file, -f <path>`: Read text from a file
- `[text]`: Process inline text directly

### Using the Grammar Fixer API

You can also use the grammar fixer programmatically in your Node.js applications:

```javascript
const { fixGrammar } = require('./src/grammarFixer');

async function checkGrammar() {
  const text = "She dont like apples";
  
  try {
    const corrections = await fixGrammar(text);
    
    console.log('Corrections found:', corrections);
    // Output:
    // [
    //   {
    //     location: { start: 4, end: 8 },
    //     oldText: "dont",
    //     newText: "doesn't",
    //     explanation: "Incorrect contraction"
    //   }
    // ]
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkGrammar();
```

### Custom Configuration

You can customize the Ollama host and model:

```javascript
const corrections = await fixGrammar(text, {
  model: 'gemma3',  // or another model
  host: 'http://localhost:11434'  // your Ollama host
});
```

### Output Format

Each correction object contains:
- **location**: Object with `start` and `end` positions (character indices)
- **oldText**: The incorrect text that was found
- **newText**: The corrected text
- **explanation** (optional): Brief explanation of the grammar error

Example output:
```json
[
  {
    "location": { "start": 4, "end": 8 },
    "oldText": "dont",
    "newText": "doesn't",
    "explanation": "Incorrect contraction"
  },
  {
    "location": { "start": 15, "end": 17 },
    "oldText": "go",
    "newText": "goes",
    "explanation": "Subject-verb agreement"
  }
]
```

## Testing

This project uses Jest as the testing framework.

### Run all tests:
```bash
npm test
```

### Run tests in watch mode:
```bash
npm test:watch
```

### Run tests with coverage:
```bash
npm test:coverage
```

## Project Structure

```
grammar-fixer-ollama-gemma3/
├── src/
│   ├── index.js           # Entry point of the application
│   └── grammarFixer.js    # Core grammar fixing logic
├── tests/
│   └── grammarFixer.test.js  # Jest tests
├── data/
│   └── (sample input data)
├── package.json           # Project dependencies and scripts
├── README.md             # This file
└── .gitignore           # Git ignore rules
```

## API Reference

### `fixGrammar(text, options)`

Analyzes the input text and returns an array of grammar corrections.

**Parameters:**
- `text` (string): The text to analyze and correct
- `options` (object, optional): Configuration options
  - `model` (string): Model to use (default: 'gemma3')
  - `host` (string): Ollama host URL (default: 'http://localhost:11434')

**Returns:**
- `Promise<Array>`: Array of correction objects with the following structure:
  ```javascript
  {
    location: { start: number, end: number },
    oldText: string,
    newText: string,
    explanation: string  // Optional
  }
  ```

**Throws:**
- Error if text is not a valid non-empty string
- Error if unable to connect to Ollama

**Example:**
```javascript
const corrections = await fixGrammar('She dont like apples', {
  model: 'gemma3',
  host: 'http://localhost:11434'
});
```

### `applyCorrections(text, corrections)`

Applies an array of corrections to the original text.

**Parameters:**
- `text` (string): Original text
- `corrections` (Array): Array of correction objects from `fixGrammar()`

**Returns:**
- `string`: The corrected text

**Example:**
```javascript
const { fixGrammar } = require('./src/grammarFixer');
const { applyCorrections } = require('./src/index');

const text = "She dont like apples";
const corrections = await fixGrammar(text);
const correctedText = applyCorrections(text, corrections);
console.log(correctedText); // "She doesn't like apples"
```

## Development

### Adding New Features

1. Implement your feature in the `src/` directory
2. Add corresponding tests in the `tests/` directory
3. Run tests to ensure everything works: `npm test`

### Code Structure

- `src/index.js`: Main entry point, demonstrates usage
- `src/grammarFixer.js`: Contains the core logic for interacting with Ollama and processing grammar corrections

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Acknowledgments

- [Ollama](https://ollama.ai/) for providing the local LLM infrastructure
- [Gemma3](https://ai.google.dev/gemma) for the powerful language model
