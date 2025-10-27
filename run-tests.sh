#!/bin/bash
# Script to run tests with real Ollama
# This script ensures Ollama is running before executing tests

set -e

echo "========================================="
echo "Grammar Fixer - Test Runner with Ollama"
echo "========================================="
echo ""

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    echo "❌ Error: Ollama is not installed"
    echo ""
    echo "Please install Ollama first:"
    echo "  curl -fsSL https://ollama.com/install.sh | sh"
    echo ""
    exit 1
fi

echo "✓ Ollama is installed"

# Check if Ollama is running
if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "❌ Error: Ollama is not running"
    echo ""
    echo "Please start Ollama in another terminal:"
    echo "  ollama serve"
    echo ""
    echo "Or run it in the background:"
    echo "  ollama serve > /tmp/ollama.log 2>&1 &"
    echo ""
    exit 1
fi

echo "✓ Ollama is running"

# Check if a compatible model is available
MODEL=${OLLAMA_MODEL:-gemma3}
echo ""
echo "Checking for model: $MODEL"

if ! ollama list | grep -q "$MODEL"; then
    echo "⚠️  Warning: Model '$MODEL' not found"
    echo ""
    echo "Attempting to pull the model..."
    
    if ollama pull "$MODEL"; then
        echo "✓ Model '$MODEL' pulled successfully"
    else
        echo "❌ Failed to pull model '$MODEL'"
        echo ""
        echo "Please pull a compatible model manually:"
        echo "  ollama pull gemma3"
        echo "  or"
        echo "  ollama pull gemma:2b"
        echo ""
        exit 1
    fi
else
    echo "✓ Model '$MODEL' is available"
fi

echo ""
echo "Running tests..."
echo "========================================="
echo ""

# Set environment variables
export OLLAMA_HOST=${OLLAMA_HOST:-http://localhost:11434}
export OLLAMA_MODEL=$MODEL

# Run tests
if npm test; then
    echo ""
    echo "========================================="
    echo "✓ All tests completed successfully!"
    echo "========================================="
else
    echo ""
    echo "========================================="
    echo "❌ Tests failed!"
    echo "========================================="
    exit 1
fi
