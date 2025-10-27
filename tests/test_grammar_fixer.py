"""
Tests for Grammar Fixer Module
"""

import pytest
import sys
import os

# Add src directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

from grammar_fixer import GrammarFixer


@pytest.fixture
def fixer():
    """Create a GrammarFixer instance for testing."""
    return GrammarFixer()


class TestFixGrammar:
    """Tests for the fix_grammar method."""

    @pytest.mark.asyncio
    async def test_invalid_input_none(self, fixer):
        """Should raise error for None input."""
        with pytest.raises(ValueError, match="Invalid input: text must be a non-empty string"):
            await fixer.fix_grammar(None)

    @pytest.mark.asyncio
    async def test_invalid_input_empty_string(self, fixer):
        """Should raise error for empty string input."""
        with pytest.raises(ValueError, match="Invalid input: text must be a non-empty string"):
            await fixer.fix_grammar("")

    @pytest.mark.asyncio
    async def test_invalid_input_number(self, fixer):
        """Should raise error for number input."""
        with pytest.raises(ValueError, match="Invalid input: text must be a non-empty string"):
            await fixer.fix_grammar(123)

    @pytest.mark.asyncio
    async def test_valid_input_returns_list(self, fixer):
        """Should return a list for valid input."""
        result = await fixer.fix_grammar("This is a test sentence")
        assert isinstance(result, list)

    @pytest.mark.asyncio
    async def test_placeholder_returns_empty_list(self, fixer):
        """Should return empty list in placeholder implementation."""
        result = await fixer.fix_grammar("She dont like apples")
        assert isinstance(result, list)
        # Note: In placeholder implementation, this returns empty list
        # When Ollama integration is complete, this should return actual corrections


class TestIsValidCorrection:
    """Tests for the is_valid_correction method."""

    def test_valid_correction_object(self):
        """Should return True for valid correction object."""
        valid_correction = {
            "location": {"start": 0, "end": 5},
            "oldText": "dont",
            "newText": "doesn't",
        }
        assert GrammarFixer.is_valid_correction(valid_correction) is True

    def test_correction_missing_location(self):
        """Should return False for correction missing location."""
        invalid_correction = {"oldText": "dont", "newText": "doesn't"}
        assert GrammarFixer.is_valid_correction(invalid_correction) is False

    def test_correction_invalid_location_start(self):
        """Should return False for correction with invalid location.start."""
        invalid_correction = {
            "location": {"start": "invalid", "end": 5},
            "oldText": "dont",
            "newText": "doesn't",
        }
        assert GrammarFixer.is_valid_correction(invalid_correction) is False

    def test_correction_invalid_location_end(self):
        """Should return False for correction with invalid location.end."""
        invalid_correction = {
            "location": {"start": 0, "end": "invalid"},
            "oldText": "dont",
            "newText": "doesn't",
        }
        assert GrammarFixer.is_valid_correction(invalid_correction) is False

    def test_correction_non_string_old_text(self):
        """Should return False for correction with non-string oldText."""
        invalid_correction = {
            "location": {"start": 0, "end": 5},
            "oldText": 123,
            "newText": "doesn't",
        }
        assert GrammarFixer.is_valid_correction(invalid_correction) is False

    def test_correction_non_string_new_text(self):
        """Should return False for correction with non-string newText."""
        invalid_correction = {
            "location": {"start": 0, "end": 5},
            "oldText": "dont",
            "newText": 123,
        }
        assert GrammarFixer.is_valid_correction(invalid_correction) is False

    def test_correction_none(self):
        """Should return False for None."""
        assert GrammarFixer.is_valid_correction(None) is False

    def test_correction_not_dict(self):
        """Should return False for non-dict input."""
        assert GrammarFixer.is_valid_correction("invalid") is False


class TestFindSubstringPosition:
    """Tests for the find_substring_position method."""

    def test_find_substring_at_beginning(self):
        """Should find substring at the beginning."""
        result = GrammarFixer.find_substring_position("Hello world", "Hello")
        assert result == {"start": 0, "end": 5}

    def test_find_substring_in_middle(self):
        """Should find substring in the middle."""
        result = GrammarFixer.find_substring_position("Hello world", "world")
        assert result == {"start": 6, "end": 11}

    def test_find_substring_at_end(self):
        """Should find substring at the end."""
        result = GrammarFixer.find_substring_position("Hello world", "ld")
        assert result == {"start": 9, "end": 11}

    def test_substring_not_found(self):
        """Should return None for substring not found."""
        result = GrammarFixer.find_substring_position("Hello world", "xyz")
        assert result is None

    def test_find_substring_with_start_index(self):
        """Should find substring starting from given index."""
        result = GrammarFixer.find_substring_position("Hello world hello", "hello", 6)
        assert result == {"start": 12, "end": 17}

    def test_handle_empty_substring(self):
        """Should handle empty substring."""
        result = GrammarFixer.find_substring_position("Hello world", "")
        assert result == {"start": 0, "end": 0}


class TestIntegration:
    """Integration tests."""

    @pytest.mark.asyncio
    async def test_multiple_corrections_in_sequence(self, fixer):
        """Should handle multiple corrections in sequence."""
        texts = ["This is correct", "She dont like it", "He go to school"]

        for text in texts:
            result = await fixer.fix_grammar(text)
            assert isinstance(result, list)
