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

```bash
npm start
```

### Using the Grammar Fixer

```javascript
const { fixGrammar } = require('./src/grammarFixer');

const text = "She dont like apples";
const corrections = await fixGrammar(text);

console.log(corrections);
// Output:
// [
//   {
//     location: { start: 4, end: 9 },
//     oldText: "dont",
//     newText: "doesn't"
//   }
// ]
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

### `fixGrammar(text)`

Analyzes the input text and returns an array of grammar corrections.

**Parameters:**
- `text` (string): The text to analyze and correct

**Returns:**
- `Promise<Array>`: Array of correction objects with the following structure:
  ```javascript
  {
    location: { start: number, end: number },
    oldText: string,
    newText: string
  }
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
