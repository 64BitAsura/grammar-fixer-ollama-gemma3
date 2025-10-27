#!/usr/bin/env python3
"""
Demo script showing the JSON API response format
"""

import json


def demo_json_response():
    """
    Demonstrates the JSON response format of the grammar fixer.
    """
    print("=" * 60)
    print("Grammar Fixer - JSON Response Demo")
    print("=" * 60)
    print()

    # Example: What the actual response would look like with Ollama integration
    example_response = {
        "corrections": [
            {
                "location": {"start": 4, "end": 8},
                "oldText": "dont",
                "newText": "doesn't"
            }
        ],
        "originalText": "She dont like apples"
    }

    print("Example API Response (JSON format):")
    print("-" * 60)
    print(json.dumps(example_response, indent=2))
    print()

    print("API Endpoint: POST /api/fix")
    print("Request Body:")
    print("-" * 60)
    request_body = {"text": "She dont like apples"}
    print(json.dumps(request_body, indent=2))
    print()

    print("Response Structure:")
    print("-" * 60)
    print("- corrections: List of grammar corrections")
    print("  - location: Character positions (start, end)")
    print("  - oldText: Original incorrect text")
    print("  - newText: Corrected text")
    print("- originalText: The input text that was analyzed")
    print()

    print("=" * 60)


if __name__ == "__main__":
    demo_json_response()
