#!/bin/bash
# API Demo Script - Test the Grammar Fixer API endpoints

echo "=========================================="
echo "Grammar Fixer API - Demo Script"
echo "=========================================="
echo ""
echo "Note: Start the API server first with: cd src && python api.py"
echo ""

API_URL="http://localhost:5000"

echo "1. Testing Home Endpoint (GET /)"
echo "------------------------------------------"
curl -s "${API_URL}/" | python -m json.tool
echo ""
echo ""

echo "2. Testing Health Check (GET /health)"
echo "------------------------------------------"
curl -s "${API_URL}/health" | python -m json.tool
echo ""
echo ""

echo "3. Testing Grammar Fixing (POST /api/fix)"
echo "------------------------------------------"
echo "Request: Fixing 'She dont like apples'"
curl -s -X POST "${API_URL}/api/fix" \
  -H "Content-Type: application/json" \
  -d '{"text": "She dont like apples"}' | python -m json.tool
echo ""
echo ""

echo "4. Testing with multiple grammar errors"
echo "------------------------------------------"
echo "Request: Fixing 'He go to school everyday'"
curl -s -X POST "${API_URL}/api/fix" \
  -H "Content-Type: application/json" \
  -d '{"text": "He go to school everyday"}' | python -m json.tool
echo ""
echo ""

echo "5. Testing error handling (missing text field)"
echo "------------------------------------------"
curl -s -X POST "${API_URL}/api/fix" \
  -H "Content-Type: application/json" \
  -d '{}' | python -m json.tool
echo ""
echo ""

echo "6. Testing error handling (invalid text type)"
echo "------------------------------------------"
curl -s -X POST "${API_URL}/api/fix" \
  -H "Content-Type: application/json" \
  -d '{"text": 123}' | python -m json.tool
echo ""
echo ""

echo "=========================================="
echo "Demo Complete!"
echo "=========================================="
