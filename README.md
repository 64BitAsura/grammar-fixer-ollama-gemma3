# Grammar Fixer - Ollama Gemma3

A production-ready Node.js application that uses Ollama with the Gemma3 model to fix grammar in text. The application returns structured JSON objects for each grammar change, detailing the location, original text, and corrected text.

## Features

- ✅ Fix grammar errors in text using Ollama and Gemma3
- ✅ Returns JSON objects with detailed change information:
  - Location of the change (start/end character positions)
  - Original characters (old text)
  - Corrected characters (new text)
  - Optional explanation of the grammar error
- ✅ Multiple input methods: inline text, stdin, or file
- ✅ Command-line interface with helpful options
- ✅ Easy-to-use programmatic API
- ✅ Comprehensive test coverage with Jest
- ✅ Error handling and connection management
- ✅ OpenAPI 3.0 schema for API documentation
- ✅ **Docker support with security best practices**
- ✅ **HTTP REST API for microservice deployment**
- ✅ **Docker Compose for easy deployment**

## 🐳 Docker Deployment (Microservice Mode)

The application can be deployed as a containerized microservice with full security best practices. Docker images are automatically published to Docker Hub via CI/CD. See [DOCKER.md](DOCKER.md) for complete documentation.

### Pull from Docker Hub

```bash
# Pull the latest image (replace 'username' with the actual Docker Hub username)
docker pull username/grammar-fixer-ollama-gemma3:latest

# Or pull a specific version
docker pull username/grammar-fixer-ollama-gemma3:main-abc123
```

### Quick Start with Docker Compose

```bash
# Install dependencies first (required for standard Dockerfile)
npm install --omit=dev

# Start all services (Ollama + Grammar Fixer)
docker-compose up -d

# Pull the model (first time only)
docker-compose exec ollama ollama pull gemma3

# Test the API
curl -X POST http://localhost:3000/grammar/fix \
  -H "Content-Type: application/json" \
  -d '{"text": "She dont like apples"}'
```

**Note**: Two Dockerfile options available:
- `Dockerfile` - Standard version (copies node_modules from host, works in restricted environments)
- `Dockerfile.multistage` - Multi-stage build (installs dependencies in container, ideal for production)

### Docker Security Features

- ✅ Non-root user (UID 1001)
- ✅ Multi-stage build for minimal image size
- ✅ Alpine Linux base for reduced attack surface
- ✅ Health checks and graceful shutdown
- ✅ Resource limits and security options
- ✅ No new privileges flag
- ✅ Security headers on all HTTP responses

### API Endpoints

When running as a microservice:

- `GET /health` - Health check endpoint
- `POST /grammar/fix` - Fix grammar in text
- `POST /grammar/apply` - Apply corrections to text
- `GET /` - API information

See [DOCKER.md](DOCKER.md) for detailed API documentation and deployment instructions.

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

Run the comprehensive examples:
```bash
npm run examples
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

This project uses Jest as the testing framework. **Important**: Tests now connect to a real Ollama instance rather than using mocks.

### Prerequisites for Testing:
- Ollama must be installed and running (`ollama serve`)
- A compatible model must be available (gemma3 or gemma:2b)

### Quick Start - Using the Test Script:
```bash
# Make sure Ollama is running
ollama serve &

# Make the script executable (first time only)
chmod +x run-tests.sh

# Run the test script (automatically checks prerequisites)
./run-tests.sh
```

### Manual Testing:

### Run all tests:
```bash
# Ensure Ollama is running
ollama serve &

# Pull the model if not already done
ollama pull gemma3

# Run tests
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

### Environment Variables for Testing:
- `OLLAMA_HOST`: Set custom Ollama host (default: http://localhost:11434)
- `OLLAMA_MODEL`: Set custom model (default: gemma3)

Example:
```bash
OLLAMA_HOST=http://localhost:11434 OLLAMA_MODEL=gemma:2b npm test
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
├── openapi.yaml           # OpenAPI 3.0 schema (YAML format)
├── openapi.json           # OpenAPI 3.0 schema (JSON format)
├── package.json           # Project dependencies and scripts
├── README.md             # This file
└── .gitignore           # Git ignore rules
```

## OpenAPI Schema

This project includes a comprehensive OpenAPI 3.0 schema that documents the API endpoints, request/response formats, and data models.

### Schema Files

- **`openapi.yaml`**: OpenAPI schema in YAML format (recommended)
- **`openapi.json`**: OpenAPI schema in JSON format

### Viewing the API Documentation

You can view the API documentation using various tools:

#### Using npm scripts (Recommended)
```bash
# View using Redoc (recommended)
npm run docs

# View using Swagger UI
npm run docs:swagger

# Validate the OpenAPI schema
npm run validate:openapi
```

#### Using Swagger UI (Online)
1. Go to [Swagger Editor](https://editor.swagger.io/)
2. Copy and paste the contents of `openapi.yaml`
3. View the interactive documentation

#### Using Swagger UI (Local)
```bash
npx --yes swagger-ui-watcher openapi.yaml
```

#### Using Redoc (Local)
```bash
npx --yes @redocly/cli preview-docs openapi.yaml
```

### API Endpoints

The OpenAPI schema documents the following endpoints:

#### `POST /grammar/fix`
Analyzes text and returns grammar corrections.

**Request:**
```json
{
  "text": "She dont like apples",
  "options": {
    "model": "gemma3",
    "host": "http://localhost:11434"
  }
}
```

**Response:**
```json
{
  "corrections": [
    {
      "location": { "start": 4, "end": 8 },
      "oldText": "dont",
      "newText": "doesn't",
      "explanation": "Incorrect contraction"
    }
  ]
}
```

#### `POST /grammar/apply`
Applies corrections to the original text.

**Request:**
```json
{
  "text": "She dont like apples",
  "corrections": [
    {
      "location": { "start": 4, "end": 8 },
      "oldText": "dont",
      "newText": "doesn't"
    }
  ]
}
```

**Response:**
```json
{
  "originalText": "She dont like apples",
  "correctedText": "She doesn't like apples"
}
```

#### `GET /health`
Health check endpoint to verify the service status.

**Response:**
```json
{
  "status": "healthy",
  "ollama": "connected",
  "model": "gemma3"
}
```

### Validating the Schema

You can validate the OpenAPI schema using:

```bash
npm run validate:openapi
```

Or directly with:
```bash
npx --yes @apidevtools/swagger-cli validate openapi.yaml
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

### Running Tests

Run all tests:
```bash
npm test
```

Run tests in watch mode for development:
```bash
npm test:watch
```

Run tests with coverage report:
```bash
npm test:coverage
```

### Code Structure

- `src/index.js`: Main entry point with CLI interface and input handling
- `src/grammarFixer.js`: Core grammar correction logic with Ollama integration
- `tests/`: Comprehensive Jest test suites
- `data/`: Sample input files for testing

### Architecture

The application follows a modular architecture:

1. **Input Layer** (`index.js`): Handles various input sources (CLI args, stdin, files)
2. **Processing Layer** (`grammarFixer.js`): Communicates with Ollama/Gemma3 to identify grammar errors
3. **Output Layer** (`index.js`): Formats and displays results in JSON format

### How It Works

1. Input text is received from the user
2. The text is sent to Ollama with a carefully crafted prompt
3. Gemma3 analyzes the text and returns grammar corrections in JSON format
4. The response is parsed and validated
5. Character positions are calculated for each correction
6. Results are returned as structured JSON objects

## Examples

### Example 1: Basic Grammar Correction

```bash
$ npm start -- "She dont like apples"
```

Output:
```json
[
  {
    "location": { "start": 4, "end": 8 },
    "oldText": "dont",
    "newText": "doesn't",
    "explanation": "Incorrect contraction"
  }
]
```

### Example 2: Multiple Errors

```bash
$ npm start -- "He go to school and she dont care"
```

Output:
```json
[
  {
    "location": { "start": 3, "end": 5 },
    "oldText": "go",
    "newText": "goes",
    "explanation": "Subject-verb agreement"
  },
  {
    "location": { "start": 24, "end": 28 },
    "oldText": "dont",
    "newText": "doesn't",
    "explanation": "Incorrect contraction"
  }
]
```

### Example 3: Processing a File

Create a file `my-text.txt`:
```
She dont like apples.
He go to school everyday.
```

Run:
```bash
$ npm start -- --file my-text.txt
```

### Example 4: Using as a Module

```javascript
const { fixGrammar } = require('./src/grammarFixer');
const { applyCorrections } = require('./src/index');

async function correctGrammar(text) {
  try {
    // Get corrections
    const corrections = await fixGrammar(text);
    
    // Display corrections
    console.log('Found', corrections.length, 'corrections');
    corrections.forEach(c => {
      console.log(`- "${c.oldText}" → "${c.newText}"`);
    });
    
    // Apply corrections to get corrected text
    const correctedText = applyCorrections(text, corrections);
    console.log('Corrected:', correctedText);
    
    return { corrections, correctedText };
  } catch (error) {
    console.error('Error:', error.message);
  }
}

correctGrammar('She dont like apples');
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Steps to Contribute

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes and add tests
4. Run tests to ensure everything works (`npm test`)
5. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
6. Push to the branch (`git push origin feature/AmazingFeature`)
7. Open a Pull Request

## Troubleshooting

### "Unable to connect to Ollama" Error

**Problem**: The application cannot connect to Ollama.

**Solutions**:
1. Ensure Ollama is installed: Visit https://ollama.ai/
2. Start Ollama service: `ollama serve`
3. Verify Ollama is running: `curl http://localhost:11434/api/tags`
4. Check if port 11434 is available and not blocked by firewall

### "Model not found" Error

**Problem**: The Gemma3 model is not available.

**Solution**:
```bash
ollama pull gemma3
```

### Slow Response Times

**Problem**: Grammar checking takes a long time.

**Causes and Solutions**:
- **First run**: Model loading takes time on first request (normal)
- **Large text**: Break text into smaller chunks
- **System resources**: Ollama requires adequate RAM and CPU
- **Model size**: Gemma3 is a large model; ensure your system meets requirements

### Tests Failing

**Problem**: Tests fail when running `npm test`.

**Solution**:
- Tests now connect to a real Ollama instance and require Ollama to be running
- Ensure Ollama is installed and running: `ollama serve`
- Ensure the gemma3 model is pulled: `ollama pull gemma3` (or use `ollama pull gemma:2b` as fallback)
- Ensure all dependencies are installed: `npm install`
- Clear Jest cache if needed: `npm test -- --clearCache`
- Check Node.js version (requires v16+): `node --version`
- Set environment variables if using custom host: `OLLAMA_HOST=http://localhost:11434 npm test`

### Running Tests

**Prerequisites**:
1. Ollama must be installed and running
2. A compatible model (gemma3 or gemma:2b) must be pulled

**Run tests**:
```bash
# Start Ollama in the background
ollama serve &

# Pull the model (if not already done)
ollama pull gemma3

# Run the tests
npm test
```

**With custom Ollama host**:
```bash
OLLAMA_HOST=http://your-host:11434 npm test
```

**With custom model**:
```bash
OLLAMA_MODEL=gemma:2b npm test
```

### Custom Ollama Host

If Ollama is running on a different host or port:

```javascript
const corrections = await fixGrammar(text, {
  host: 'http://your-host:11434'
});
```

## Performance

- **Average response time**: 1-3 seconds per text (depends on text length and system)
- **Recommended text length**: Up to 500 words per request
- **Concurrent requests**: Supported through Node.js async operations
- **Memory usage**: Depends on Ollama model size (Gemma3 requires ~8GB RAM)

## Limitations

- Requires Ollama to be running locally or accessible over network
- Grammar corrections depend on the quality of the Gemma3 model
- May not catch all grammar errors or may flag correct usage as errors
- Processing time increases with text length
- Requires adequate system resources for running Ollama

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Acknowledgments

- [Ollama](https://ollama.ai/) for providing the local LLM infrastructure
- [Gemma3](https://ai.google.dev/gemma) for the powerful language model
