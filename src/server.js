/**
 * HTTP Server for Grammar Fixer Microservice
 * 
 * Provides REST API endpoints for the grammar fixing service
 */

const http = require('http');
const { fixGrammar } = require('./grammarFixer');
const { applyCorrections } = require('./index');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

/**
 * Parse JSON body from request
 * @param {http.IncomingMessage} req - The request object
 * @returns {Promise<Object>} Parsed JSON body
 */
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        if (body) {
          resolve(JSON.parse(body));
        } else {
          resolve({});
        }
      } catch (error) {
        reject(new Error('Invalid JSON'));
      }
    });
    
    req.on('error', reject);
  });
}

/**
 * Send JSON response
 * @param {http.ServerResponse} res - The response object
 * @param {number} statusCode - HTTP status code
 * @param {Object} data - Data to send
 */
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
  });
  res.end(JSON.stringify(data, null, 2));
}

/**
 * Handle health check endpoint
 * @param {http.ServerResponse} res - The response object
 */
async function handleHealthCheck(res) {
  try {
    // Simple health check - could be extended to check Ollama connectivity
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'grammar-fixer-ollama-gemma3',
      version: '1.0.0'
    };
    
    sendJson(res, 200, health);
  } catch (error) {
    sendJson(res, 503, {
      status: 'unhealthy',
      error: error.message
    });
  }
}

/**
 * Handle grammar fix endpoint
 * @param {http.IncomingMessage} req - The request object
 * @param {http.ServerResponse} res - The response object
 */
async function handleFixGrammar(req, res) {
  try {
    const body = await parseBody(req);
    
    if (!body.text) {
      sendJson(res, 400, {
        error: 'Bad Request',
        message: 'Missing required field: text'
      });
      return;
    }
    
    const options = body.options || {};
    const corrections = await fixGrammar(body.text, options);
    
    sendJson(res, 200, {
      corrections,
      count: corrections.length
    });
  } catch (error) {
    console.error('Error in handleFixGrammar:', error);
    sendJson(res, 500, {
      error: 'Internal Server Error',
      message: error.message
    });
  }
}

/**
 * Handle grammar apply endpoint
 * @param {http.IncomingMessage} req - The request object
 * @param {http.ServerResponse} res - The response object
 */
async function handleApplyCorrections(req, res) {
  try {
    const body = await parseBody(req);
    
    if (!body.text || !body.corrections) {
      sendJson(res, 400, {
        error: 'Bad Request',
        message: 'Missing required fields: text and corrections'
      });
      return;
    }
    
    const correctedText = applyCorrections(body.text, body.corrections);
    
    sendJson(res, 200, {
      originalText: body.text,
      correctedText,
      corrections: body.corrections
    });
  } catch (error) {
    console.error('Error in handleApplyCorrections:', error);
    sendJson(res, 500, {
      error: 'Internal Server Error',
      message: error.message
    });
  }
}

/**
 * Handle 404 Not Found
 * @param {http.ServerResponse} res - The response object
 */
function handleNotFound(res) {
  sendJson(res, 404, {
    error: 'Not Found',
    message: 'The requested endpoint does not exist'
  });
}

/**
 * Handle 405 Method Not Allowed
 * @param {http.ServerResponse} res - The response object
 * @param {string} allowedMethods - Comma-separated list of allowed methods
 */
function handleMethodNotAllowed(res, allowedMethods) {
  res.writeHead(405, {
    'Content-Type': 'application/json',
    'Allow': allowedMethods
  });
  res.end(JSON.stringify({
    error: 'Method Not Allowed',
    message: `Allowed methods: ${allowedMethods}`
  }, null, 2));
}

/**
 * Main request handler
 * @param {http.IncomingMessage} req - The request object
 * @param {http.ServerResponse} res - The response object
 */
async function requestHandler(req, res) {
  const { method, url } = req;
  
  console.log(`${new Date().toISOString()} - ${method} ${url}`);
  
  // Health check endpoint
  if (url === '/health' || url === '/health/') {
    if (method === 'GET') {
      return handleHealthCheck(res);
    }
    return handleMethodNotAllowed(res, 'GET');
  }
  
  // Grammar fix endpoint
  if (url === '/grammar/fix' || url === '/grammar/fix/') {
    if (method === 'POST') {
      return handleFixGrammar(req, res);
    }
    return handleMethodNotAllowed(res, 'POST');
  }
  
  // Apply corrections endpoint
  if (url === '/grammar/apply' || url === '/grammar/apply/') {
    if (method === 'POST') {
      return handleApplyCorrections(req, res);
    }
    return handleMethodNotAllowed(res, 'POST');
  }
  
  // Root endpoint - API info
  if (url === '/' || url === '') {
    if (method === 'GET') {
      sendJson(res, 200, {
        service: 'grammar-fixer-ollama-gemma3',
        version: '1.0.0',
        endpoints: {
          health: 'GET /health',
          fixGrammar: 'POST /grammar/fix',
          applyCorrections: 'POST /grammar/apply'
        },
        documentation: 'See openapi.yaml for full API specification'
      });
      return;
    }
    return handleMethodNotAllowed(res, 'GET');
  }
  
  // 404 for all other routes
  handleNotFound(res);
}

/**
 * Create and start the HTTP server
 */
function startServer() {
  const server = http.createServer(requestHandler);
  
  server.listen(PORT, HOST, () => {
    console.log(`Grammar Fixer Microservice running on http://${HOST}:${PORT}`);
    console.log(`Health check: http://${HOST}:${PORT}/health`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Ollama Host: ${process.env.OLLAMA_HOST || 'http://localhost:11434'}`);
    console.log(`Ollama Model: ${process.env.OLLAMA_MODEL || 'gemma3'}`);
  });
  
  // Graceful shutdown
  const shutdown = () => {
    console.log('\nShutting down gracefully...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
    
    // Force close after 10 seconds
    setTimeout(() => {
      console.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };
  
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
  
  return server;
}

// Start server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = {
  startServer,
  requestHandler
};
