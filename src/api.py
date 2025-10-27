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
    
    Note: Currently uses asyncio.run() which creates a new event loop per request.
    For production use, consider Flask-AsyncIO or similar async handling solutions
    for better performance.
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
        # TODO: For production, consider using Flask-AsyncIO for better async handling
        corrections = asyncio.run(fixer.fix_grammar(text))

        # Return JSON response
        return jsonify({"corrections": corrections, "originalText": text})

    except ValueError as error:
        # ValueError is raised by our own validation logic with safe, user-facing error messages
        # The messages are defined in grammar_fixer.py and are intentionally safe to expose
        # CodeQL may flag this, but it's a false positive as we control these error messages
        error_message = str(error)
        # Ensure it's our expected validation error (starts with "Invalid input")
        if "Invalid input" in error_message:
            # Safe to return: this is our own controlled validation message
            return jsonify({"error": error_message}), 400
        else:
            # Unexpected ValueError - log and return generic message for safety
            import logging
            logging.error(f"Unexpected ValueError in fix_grammar_endpoint: {error}")
            return jsonify({"error": "An error occurred while validating your request"}), 400
    except Exception as error:
        # Log the error internally but don't expose details to user
        import logging
        logging.error(f"Internal error in fix_grammar_endpoint: {error}")
        return jsonify({"error": "An internal error occurred while processing your request"}), 500


@app.route("/health", methods=["GET"])
def health_check():
    """
    Health check endpoint.
    """
    return jsonify({"status": "healthy", "service": "grammar-fixer-api"})


if __name__ == "__main__":
    import os
    
    # Get debug mode from environment variable (default: False for security)
    debug_mode = os.getenv("FLASK_DEBUG", "False").lower() in ("true", "1", "yes")
    
    print("Starting Grammar Fixer API Server...")
    print("API documentation available at: http://localhost:5000/")
    print("Grammar fixing endpoint: http://localhost:5000/api/fix")
    
    if debug_mode:
        print("WARNING: Running in DEBUG mode. Do not use in production!")
    
    app.run(host="0.0.0.0", port=5000, debug=debug_mode)
