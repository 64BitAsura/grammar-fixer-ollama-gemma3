#!/usr/bin/env python3
"""
Grammar Fixer API Server

Flask API server that provides JSON responses for grammar correction.
"""

from flask import Flask, request, jsonify
import asyncio
from grammar_fixer import GrammarFixer

app = Flask(__name__)
fixer = GrammarFixer()


@app.route("/", methods=["GET"])
def home():
    """
    Home endpoint with API information.
    """
    return jsonify(
        {
            "name": "Grammar Fixer API - Ollama Gemma3",
            "version": "1.0.0",
            "description": "API for fixing grammar using Ollama and Gemma3",
            "endpoints": {
                "/api/fix": {
                    "method": "POST",
                    "description": "Fix grammar in provided text",
                    "body": {"text": "string (required)"},
                    "response": {
                        "corrections": [
                            {
                                "location": {"start": "int", "end": "int"},
                                "oldText": "string",
                                "newText": "string",
                            }
                        ]
                    },
                }
            },
        }
    )


@app.route("/api/fix", methods=["POST"])
def fix_grammar_endpoint():
    """
    Fix grammar endpoint.

    Accepts JSON with 'text' field and returns corrections.
    """
    try:
        # Get JSON data from request
        data = request.get_json(silent=True)

        if data is None:
            return (
                jsonify({"error": "Invalid request: JSON body required"}),
                400,
            )

        # Extract text from request
        text = data.get("text")

        if text is None:
            return (
                jsonify({"error": "Invalid request: 'text' field is required"}),
                400,
            )

        if not isinstance(text, str):
            return (
                jsonify({"error": "Invalid request: 'text' must be a string"}),
                400,
            )

        # Fix grammar using async function
        corrections = asyncio.run(fixer.fix_grammar(text))

        # Return JSON response
        return jsonify({"corrections": corrections, "originalText": text})

    except ValueError as error:
        return jsonify({"error": str(error)}), 400
    except Exception as error:
        return jsonify({"error": f"Internal server error: {str(error)}"}), 500


@app.route("/health", methods=["GET"])
def health_check():
    """
    Health check endpoint.
    """
    return jsonify({"status": "healthy", "service": "grammar-fixer-api"})


if __name__ == "__main__":
    print("Starting Grammar Fixer API Server...")
    print("API documentation available at: http://localhost:5000/")
    print("Grammar fixing endpoint: http://localhost:5000/api/fix")
    app.run(host="0.0.0.0", port=5000, debug=True)
