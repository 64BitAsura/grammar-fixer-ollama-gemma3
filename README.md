# Grammar Fixer - Ollama Gemma3

A Python application with REST API that uses Ollama with the Gemma3 model to fix grammar in text. The application returns structured JSON objects for each grammar change, detailing the location, original text, and corrected text.

**Note:** This repository also includes the original Node.js implementation for reference.

## Features

- Fix grammar errors in text using Ollama and Gemma3
- Returns JSON objects with detailed change information:
  - Location of the change (start/end positions)
  - Original characters (old text)
  - Corrected characters (new text)
- **REST API with JSON responses**
- Easy-to-use Python API for grammar correction
- Both CLI and API server modes

## Prerequisites

Before running this project, make sure you have:

- **Python** (v3.8 or higher) installed
- **Ollama** installed and running on your system
- **Gemma3 model** pulled in Ollama (`ollama pull gemma3`)

For the Node.js implementation:
- **Node.js** (v16 or higher) installed

## Installation

1. Clone the repository:
```bash
git clone https://github.com/64BitAsura/grammar-fixer-ollama-gemma3.git
cd grammar-fixer-ollama-gemma3
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. (Optional) For Node.js version, install dependencies:
```bash
npm install
```

4. Ensure Ollama is running:
```bash
ollama serve
```

5. Pull the Gemma3 model (if not already done):
```bash
ollama pull gemma3
```

## Usage

### Python Implementation

#### Running the CLI Application

```bash
cd src
python index.py
```

#### Running the API Server

Start the Flask API server:

```bash
cd src
python api.py
```

The API will be available at `http://localhost:5000`

#### Making API Requests

```bash
# Get API information
curl http://localhost:5000/

# Fix grammar in text
curl -X POST http://localhost:5000/api/fix \
  -H "Content-Type: application/json" \
  -d '{"text": "She dont like apples"}'

# Health check
curl http://localhost:5000/health
```

**Example API Response:**

```json
{
  "corrections": [
    {
      "location": {"start": 4, "end": 9},
      "oldText": "dont",
      "newText": "doesn't"
    }
  ],
  "originalText": "She dont like apples"
}
```

#### Using the Python Module

```python
from grammar_fixer import GrammarFixer
import asyncio

async def main():
    fixer = GrammarFixer()
    text = "She dont like apples"
    corrections = await fixer.fix_grammar(text)
    print(corrections)

asyncio.run(main())
```

**Output:**
```python
[
  {
    "location": {"start": 4, "end": 9},
    "oldText": "dont",
    "newText": "doesn't"
  }
]
```

### Node.js Implementation (Legacy)

#### Running the Application

```bash
npm start
```

### Node.js Implementation (Legacy)

#### Running the Application

```bash
npm start
```

#### Using the Grammar Fixer

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

### Python Tests

This project uses pytest as the testing framework.

#### Run all Python tests:
```bash
pytest
```

#### Run tests with coverage:
```bash
pytest --cov=src --cov-report=html
```

#### Run tests in verbose mode:
```bash
pytest -v
```

### Node.js Tests (Legacy)

This project uses Jest as the testing framework for Node.js code.

#### Run all Node.js tests:
```bash
npm test
```

#### Run Node.js tests in watch mode:
```bash
npm test:watch
```

#### Run Node.js tests with coverage:
```bash
npm test:coverage
```

## Project Structure

```
grammar-fixer-ollama-gemma3/
├── src/
│   ├── index.py            # Python entry point/CLI
│   ├── grammar_fixer.py    # Core Python grammar fixing logic
│   ├── api.py              # Flask API server
│   ├── index.js            # Node.js entry point (legacy)
│   └── grammarFixer.js     # Node.js grammar fixing logic (legacy)
├── tests/
│   ├── test_grammar_fixer.py  # Python pytest tests
│   ├── test_api.py            # Python API tests
│   └── grammarFixer.test.js   # Jest tests (legacy)
├── data/
│   └── sample-inputs.json     # Sample input data
├── requirements.txt        # Python dependencies
├── package.json           # Node.js dependencies (legacy)
├── README.md             # This file
└── .gitignore           # Git ignore rules
```

## API Reference

### Python API

#### `GrammarFixer.fix_grammar(text)`

Analyzes the input text and returns an array of grammar corrections.

**Parameters:**
- `text` (str): The text to analyze and correct

**Returns:**
- `List[Dict]`: Array of correction objects with the following structure:
  ```python
  {
    "location": {"start": int, "end": int},
    "oldText": str,
    "newText": str
  }
  ```

### REST API Endpoints

#### `POST /api/fix`

Fix grammar in the provided text.

**Request Body:**
```json
{
  "text": "string (required)"
}
```

**Response:**
```json
{
  "corrections": [
    {
      "location": {"start": int, "end": int},
      "oldText": "string",
      "newText": "string"
    }
  ],
  "originalText": "string"
}
```

#### `GET /`

Get API information and available endpoints.

#### `GET /health`

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "service": "grammar-fixer-api"
}
```

### Node.js API (Legacy)

#### `fixGrammar(text)`

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
