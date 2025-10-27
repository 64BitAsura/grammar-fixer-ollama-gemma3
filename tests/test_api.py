"""
Tests for Grammar Fixer API
"""

import pytest
import sys
import os
import json

# Add src directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

from api import app


@pytest.fixture
def client():
    """Create a test client for the Flask app."""
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


class TestAPIEndpoints:
    """Tests for API endpoints."""

    def test_home_endpoint(self, client):
        """Test home endpoint returns API information."""
        response = client.get("/")
        assert response.status_code == 200
        data = json.loads(response.data)
        assert "name" in data
        assert "version" in data
        assert "endpoints" in data

    def test_health_check_endpoint(self, client):
        """Test health check endpoint."""
        response = client.get("/health")
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data["status"] == "healthy"
        assert data["service"] == "grammar-fixer-api"

    def test_fix_grammar_endpoint_valid_input(self, client):
        """Test fix grammar endpoint with valid input."""
        response = client.post(
            "/api/fix",
            data=json.dumps({"text": "She dont like apples"}),
            content_type="application/json",
        )
        assert response.status_code == 200
        data = json.loads(response.data)
        assert "corrections" in data
        assert "originalText" in data
        assert isinstance(data["corrections"], list)
        assert data["originalText"] == "She dont like apples"

    def test_fix_grammar_endpoint_missing_json(self, client):
        """Test fix grammar endpoint with missing JSON body."""
        response = client.post("/api/fix")
        assert response.status_code == 400
        data = json.loads(response.data)
        assert "error" in data
        assert "JSON body required" in data["error"]

    def test_fix_grammar_endpoint_missing_text_field(self, client):
        """Test fix grammar endpoint with missing text field."""
        response = client.post(
            "/api/fix", data=json.dumps({}), content_type="application/json"
        )
        assert response.status_code == 400
        data = json.loads(response.data)
        assert "error" in data
        assert "'text' field is required" in data["error"]

    def test_fix_grammar_endpoint_invalid_text_type(self, client):
        """Test fix grammar endpoint with invalid text type."""
        response = client.post(
            "/api/fix", data=json.dumps({"text": 123}), content_type="application/json"
        )
        assert response.status_code == 400
        data = json.loads(response.data)
        assert "error" in data
        assert "string" in data["error"]

    def test_fix_grammar_endpoint_empty_text(self, client):
        """Test fix grammar endpoint with empty text."""
        response = client.post(
            "/api/fix", data=json.dumps({"text": ""}), content_type="application/json"
        )
        assert response.status_code == 400
        data = json.loads(response.data)
        assert "error" in data


class TestAPIResponses:
    """Tests for API response format."""

    def test_fix_grammar_response_format(self, client):
        """Test that fix grammar response has correct JSON format."""
        response = client.post(
            "/api/fix",
            data=json.dumps({"text": "This is a test"}),
            content_type="application/json",
        )
        assert response.status_code == 200
        data = json.loads(response.data)

        # Check top-level keys
        assert "corrections" in data
        assert "originalText" in data

        # Check corrections is a list
        assert isinstance(data["corrections"], list)

        # If corrections exist, check format
        for correction in data["corrections"]:
            assert "location" in correction
            assert "oldText" in correction
            assert "newText" in correction
            assert "start" in correction["location"]
            assert "end" in correction["location"]
            assert isinstance(correction["location"]["start"], int)
            assert isinstance(correction["location"]["end"], int)
            assert isinstance(correction["oldText"], str)
            assert isinstance(correction["newText"], str)
