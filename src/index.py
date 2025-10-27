#!/usr/bin/env python3
"""
Grammar Fixer - Ollama Gemma3

Entry point for the grammar fixer application
"""

import asyncio
import json
from grammar_fixer import GrammarFixer


async def main():
    """
    Main function to demonstrate the grammar fixer.
    """
    print("Grammar Fixer - Ollama Gemma3\n")
    print("==============================\n")

    # Example texts with grammar errors
    example_texts = [
        "She dont like apples",
        "He go to school everyday",
        "They was happy to see me",
    ]

    print("Analyzing sample texts for grammar errors...\n")

    fixer = GrammarFixer()

    for text in example_texts:
        try:
            print(f'Original text: "{text}"')

            corrections = await fixer.fix_grammar(text)

            if len(corrections) == 0:
                print("No corrections found (or placeholder implementation active)\n")
            else:
                print("Corrections:")
                print(json.dumps(corrections, indent=2))
                print()
        except Exception as error:
            print(f"Error processing text: {error}\n")

    print("==============================")
    print("\nNote: This is a placeholder implementation.")
    print("To enable full functionality:")
    print("1. Ensure Ollama is running (ollama serve)")
    print("2. Pull the Gemma3 model (ollama pull gemma3)")
    print("3. Implement the Ollama integration in src/grammar_fixer.py")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except Exception as error:
        print(f"Fatal error: {error}")
        exit(1)
