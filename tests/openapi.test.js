/**
 * Tests for OpenAPI Schema
 * 
 * This test suite validates the OpenAPI schema file to ensure:
 * - Schema is valid OpenAPI 3.0 format
 * - All required components are defined
 * - Examples are valid against their schemas
 * - Request/response schemas are correctly structured
 */

const SwaggerParser = require('@apidevtools/swagger-parser');
const OpenAPISchemaValidator = require('openapi-schema-validator').default;
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

describe('OpenAPI Schema', () => {
  let openApiSpec;
  const schemaPath = path.join(__dirname, '../openapi.yaml');

  beforeAll(async () => {
    // Load the OpenAPI spec
    const fileContent = fs.readFileSync(schemaPath, 'utf8');
    openApiSpec = yaml.load(fileContent);
  });

  describe('Schema Validation', () => {
    test('should be a valid OpenAPI 3.0 schema', async () => {
      const validator = new OpenAPISchemaValidator({ version: 3 });
      const result = validator.validate(openApiSpec);
      
      expect(result.errors).toEqual([]);
    });

    test('should pass swagger-parser validation', async () => {
      await expect(
        SwaggerParser.validate(schemaPath)
      ).resolves.toBeDefined();
    });

    test('should successfully dereference the schema', async () => {
      const api = await SwaggerParser.dereference(schemaPath);
      expect(api).toBeDefined();
      expect(api.openapi).toBe('3.0.3');
    });
  });

  describe('Schema Structure', () => {
    test('should have correct OpenAPI version', () => {
      expect(openApiSpec.openapi).toBe('3.0.3');
    });

    test('should have info section with required fields', () => {
      expect(openApiSpec.info).toBeDefined();
      expect(openApiSpec.info.title).toBe('Grammar Fixer API');
      expect(openApiSpec.info.version).toBe('1.0.0');
      expect(openApiSpec.info.description).toBeDefined();
    });

    test('should have servers defined', () => {
      expect(openApiSpec.servers).toBeDefined();
      expect(Array.isArray(openApiSpec.servers)).toBe(true);
      expect(openApiSpec.servers.length).toBeGreaterThan(0);
    });

    test('should have paths defined', () => {
      expect(openApiSpec.paths).toBeDefined();
      expect(Object.keys(openApiSpec.paths).length).toBeGreaterThan(0);
    });

    test('should have components defined', () => {
      expect(openApiSpec.components).toBeDefined();
      expect(openApiSpec.components.schemas).toBeDefined();
    });
  });

  describe('POST /grammar/fix Endpoint', () => {
    let endpoint;

    beforeAll(() => {
      endpoint = openApiSpec.paths['/grammar/fix'];
    });

    test('should exist', () => {
      expect(endpoint).toBeDefined();
    });

    test('should have POST operation', () => {
      expect(endpoint.post).toBeDefined();
    });

    test('should have summary and description', () => {
      expect(endpoint.post.summary).toBeDefined();
      expect(endpoint.post.description).toBeDefined();
    });

    test('should have operationId', () => {
      expect(endpoint.post.operationId).toBe('fixGrammar');
    });

    test('should have tags', () => {
      expect(endpoint.post.tags).toBeDefined();
      expect(Array.isArray(endpoint.post.tags)).toBe(true);
      expect(endpoint.post.tags).toContain('Grammar');
    });

    test('should have requestBody', () => {
      expect(endpoint.post.requestBody).toBeDefined();
      expect(endpoint.post.requestBody.required).toBe(true);
    });

    test('should have application/json content type for request', () => {
      const content = endpoint.post.requestBody.content;
      expect(content['application/json']).toBeDefined();
    });

    test('should reference GrammarFixRequest schema', () => {
      const schema = endpoint.post.requestBody.content['application/json'].schema;
      expect(schema.$ref).toBe('#/components/schemas/GrammarFixRequest');
    });

    test('should have request examples', () => {
      const examples = endpoint.post.requestBody.content['application/json'].examples;
      expect(examples).toBeDefined();
      expect(examples.simple).toBeDefined();
      expect(examples.multiple).toBeDefined();
      expect(examples.withOptions).toBeDefined();
    });

    test('should have responses defined', () => {
      expect(endpoint.post.responses).toBeDefined();
      expect(endpoint.post.responses['200']).toBeDefined();
      expect(endpoint.post.responses['400']).toBeDefined();
      expect(endpoint.post.responses['500']).toBeDefined();
    });

    test('should have 200 response with proper schema', () => {
      const response200 = endpoint.post.responses['200'];
      expect(response200.description).toBeDefined();
      expect(response200.content['application/json']).toBeDefined();
      expect(response200.content['application/json'].schema.$ref).toBe(
        '#/components/schemas/GrammarFixResponse'
      );
    });

    test('should have 200 response examples', () => {
      const examples = endpoint.post.responses['200'].content['application/json'].examples;
      expect(examples).toBeDefined();
      expect(examples.singleCorrection).toBeDefined();
      expect(examples.multipleCorrections).toBeDefined();
      expect(examples.noCorrections).toBeDefined();
    });

    test('should have 400 response with proper schema', () => {
      const response400 = endpoint.post.responses['400'];
      expect(response400.description).toBeDefined();
      expect(response400.content['application/json'].schema.$ref).toBe(
        '#/components/schemas/ErrorResponse'
      );
    });

    test('should have 400 response examples', () => {
      const examples = endpoint.post.responses['400'].content['application/json'].examples;
      expect(examples).toBeDefined();
      expect(examples.missingText).toBeDefined();
      expect(examples.emptyText).toBeDefined();
      expect(examples.invalidType).toBeDefined();
    });

    test('should have 500 response with proper schema', () => {
      const response500 = endpoint.post.responses['500'];
      expect(response500.description).toBeDefined();
      expect(response500.content['application/json'].schema.$ref).toBe(
        '#/components/schemas/ErrorResponse'
      );
    });

    test('should have 500 response examples', () => {
      const examples = endpoint.post.responses['500'].content['application/json'].examples;
      expect(examples).toBeDefined();
      expect(examples.ollamaConnection).toBeDefined();
      expect(examples.general).toBeDefined();
    });
  });

  describe('Schema Components', () => {
    describe('GrammarFixRequest', () => {
      let schema;

      beforeAll(() => {
        schema = openApiSpec.components.schemas.GrammarFixRequest;
      });

      test('should exist', () => {
        expect(schema).toBeDefined();
      });

      test('should be an object type', () => {
        expect(schema.type).toBe('object');
      });

      test('should have required fields', () => {
        expect(schema.required).toBeDefined();
        expect(schema.required).toContain('text');
      });

      test('should have text property', () => {
        expect(schema.properties.text).toBeDefined();
        expect(schema.properties.text.type).toBe('string');
        expect(schema.properties.text.minLength).toBe(1);
      });

      test('should have options property', () => {
        expect(schema.properties.options).toBeDefined();
        expect(schema.properties.options.type).toBe('object');
      });

      test('should have model in options', () => {
        expect(schema.properties.options.properties.model).toBeDefined();
        expect(schema.properties.options.properties.model.type).toBe('string');
      });

      test('should have host in options', () => {
        expect(schema.properties.options.properties.host).toBeDefined();
        expect(schema.properties.options.properties.host.type).toBe('string');
      });
    });

    describe('GrammarFixResponse', () => {
      let schema;

      beforeAll(() => {
        schema = openApiSpec.components.schemas.GrammarFixResponse;
      });

      test('should exist', () => {
        expect(schema).toBeDefined();
      });

      test('should be an object type', () => {
        expect(schema.type).toBe('object');
      });

      test('should have required fields', () => {
        expect(schema.required).toBeDefined();
        expect(schema.required).toContain('corrections');
      });

      test('should have corrections property as array', () => {
        expect(schema.properties.corrections).toBeDefined();
        expect(schema.properties.corrections.type).toBe('array');
      });

      test('should reference Correction schema for array items', () => {
        expect(schema.properties.corrections.items.$ref).toBe(
          '#/components/schemas/Correction'
        );
      });
    });

    describe('Correction', () => {
      let schema;

      beforeAll(() => {
        schema = openApiSpec.components.schemas.Correction;
      });

      test('should exist', () => {
        expect(schema).toBeDefined();
      });

      test('should be an object type', () => {
        expect(schema.type).toBe('object');
      });

      test('should have required fields', () => {
        expect(schema.required).toBeDefined();
        expect(schema.required).toContain('location');
        expect(schema.required).toContain('oldText');
        expect(schema.required).toContain('newText');
      });

      test('should have location property', () => {
        expect(schema.properties.location).toBeDefined();
        expect(schema.properties.location.type).toBe('object');
      });

      test('should have location.start and location.end', () => {
        const location = schema.properties.location;
        expect(location.properties.start).toBeDefined();
        expect(location.properties.start.type).toBe('integer');
        expect(location.properties.start.minimum).toBe(0);
        expect(location.properties.end).toBeDefined();
        expect(location.properties.end.type).toBe('integer');
        expect(location.properties.end.minimum).toBe(0);
      });

      test('should have oldText property', () => {
        expect(schema.properties.oldText).toBeDefined();
        expect(schema.properties.oldText.type).toBe('string');
        expect(schema.properties.oldText.minLength).toBe(1);
      });

      test('should have newText property', () => {
        expect(schema.properties.newText).toBeDefined();
        expect(schema.properties.newText.type).toBe('string');
        expect(schema.properties.newText.minLength).toBe(1);
      });

      test('should have optional explanation property', () => {
        expect(schema.properties.explanation).toBeDefined();
        expect(schema.properties.explanation.type).toBe('string');
        expect(schema.required).not.toContain('explanation');
      });
    });

    describe('ErrorResponse', () => {
      let schema;

      beforeAll(() => {
        schema = openApiSpec.components.schemas.ErrorResponse;
      });

      test('should exist', () => {
        expect(schema).toBeDefined();
      });

      test('should be an object type', () => {
        expect(schema.type).toBe('object');
      });

      test('should have required fields', () => {
        expect(schema.required).toBeDefined();
        expect(schema.required).toContain('error');
        expect(schema.required).toContain('message');
        expect(schema.required).toContain('statusCode');
      });

      test('should have error property', () => {
        expect(schema.properties.error).toBeDefined();
        expect(schema.properties.error.type).toBe('string');
      });

      test('should have message property', () => {
        expect(schema.properties.message).toBeDefined();
        expect(schema.properties.message.type).toBe('string');
      });

      test('should have statusCode property', () => {
        expect(schema.properties.statusCode).toBeDefined();
        expect(schema.properties.statusCode.type).toBe('integer');
      });
    });
  });

  describe('Examples Validation', () => {
    let dereferencedSpec;

    beforeAll(async () => {
      dereferencedSpec = await SwaggerParser.dereference(schemaPath);
    });

    describe('Request Examples', () => {
      test('simple example should match request schema', () => {
        const requestSchema = dereferencedSpec.paths['/grammar/fix'].post.requestBody.content['application/json'].schema;
        const example = dereferencedSpec.paths['/grammar/fix'].post.requestBody.content['application/json'].examples.simple.value;
        
        expect(example.text).toBeDefined();
        expect(typeof example.text).toBe('string');
        expect(example.text.length).toBeGreaterThan(0);
      });

      test('multiple example should match request schema', () => {
        const example = dereferencedSpec.paths['/grammar/fix'].post.requestBody.content['application/json'].examples.multiple.value;
        
        expect(example.text).toBeDefined();
        expect(typeof example.text).toBe('string');
        expect(example.text.length).toBeGreaterThan(0);
      });

      test('withOptions example should match request schema', () => {
        const example = dereferencedSpec.paths['/grammar/fix'].post.requestBody.content['application/json'].examples.withOptions.value;
        
        expect(example.text).toBeDefined();
        expect(typeof example.text).toBe('string');
        expect(example.options).toBeDefined();
        expect(typeof example.options.model).toBe('string');
        expect(typeof example.options.host).toBe('string');
      });
    });

    describe('Response Examples', () => {
      test('singleCorrection example should match response schema', () => {
        const example = dereferencedSpec.paths['/grammar/fix'].post.responses['200'].content['application/json'].examples.singleCorrection.value;
        
        expect(example.corrections).toBeDefined();
        expect(Array.isArray(example.corrections)).toBe(true);
        expect(example.corrections.length).toBe(1);
        
        const correction = example.corrections[0];
        expect(correction.location).toBeDefined();
        expect(typeof correction.location.start).toBe('number');
        expect(typeof correction.location.end).toBe('number');
        expect(typeof correction.oldText).toBe('string');
        expect(typeof correction.newText).toBe('string');
      });

      test('multipleCorrections example should match response schema', () => {
        const example = dereferencedSpec.paths['/grammar/fix'].post.responses['200'].content['application/json'].examples.multipleCorrections.value;
        
        expect(example.corrections).toBeDefined();
        expect(Array.isArray(example.corrections)).toBe(true);
        expect(example.corrections.length).toBeGreaterThan(1);
        
        example.corrections.forEach(correction => {
          expect(correction.location).toBeDefined();
          expect(typeof correction.location.start).toBe('number');
          expect(typeof correction.location.end).toBe('number');
          expect(typeof correction.oldText).toBe('string');
          expect(typeof correction.newText).toBe('string');
        });
      });

      test('noCorrections example should match response schema', () => {
        const example = dereferencedSpec.paths['/grammar/fix'].post.responses['200'].content['application/json'].examples.noCorrections.value;
        
        expect(example.corrections).toBeDefined();
        expect(Array.isArray(example.corrections)).toBe(true);
        expect(example.corrections.length).toBe(0);
      });
    });

    describe('Error Examples', () => {
      test('400 error examples should match error schema', () => {
        const examples = dereferencedSpec.paths['/grammar/fix'].post.responses['400'].content['application/json'].examples;
        
        Object.values(examples).forEach(({ value }) => {
          expect(value.error).toBeDefined();
          expect(typeof value.error).toBe('string');
          expect(value.message).toBeDefined();
          expect(typeof value.message).toBe('string');
          expect(value.statusCode).toBeDefined();
          expect(value.statusCode).toBe(400);
        });
      });

      test('500 error examples should match error schema', () => {
        const examples = dereferencedSpec.paths['/grammar/fix'].post.responses['500'].content['application/json'].examples;
        
        Object.values(examples).forEach(({ value }) => {
          expect(value.error).toBeDefined();
          expect(typeof value.error).toBe('string');
          expect(value.message).toBeDefined();
          expect(typeof value.message).toBe('string');
          expect(value.statusCode).toBeDefined();
          expect(value.statusCode).toBe(500);
        });
      });
    });
  });

  describe('Schema Consistency', () => {
    test('should have consistent correction structure in examples', () => {
      const singleExample = openApiSpec.paths['/grammar/fix'].post.responses['200'].content['application/json'].examples.singleCorrection.value;
      const correction = singleExample.corrections[0];
      
      // Check structure matches what the actual API returns
      expect(correction).toHaveProperty('location');
      expect(correction.location).toHaveProperty('start');
      expect(correction.location).toHaveProperty('end');
      expect(correction).toHaveProperty('oldText');
      expect(correction).toHaveProperty('newText');
      expect(correction).toHaveProperty('explanation');
    });

    test('should have valid character positions in examples', () => {
      const example = openApiSpec.paths['/grammar/fix'].post.responses['200'].content['application/json'].examples.singleCorrection.value;
      const correction = example.corrections[0];
      
      expect(correction.location.start).toBeLessThan(correction.location.end);
      expect(correction.location.start).toBeGreaterThanOrEqual(0);
      expect(correction.location.end).toBeGreaterThan(0);
    });

    test('should have meaningful error messages in examples', () => {
      const badRequestExample = openApiSpec.paths['/grammar/fix'].post.responses['400'].content['application/json'].examples.missingText.value;
      const serverErrorExample = openApiSpec.paths['/grammar/fix'].post.responses['500'].content['application/json'].examples.ollamaConnection.value;
      
      expect(badRequestExample.message.length).toBeGreaterThan(0);
      expect(serverErrorExample.message.length).toBeGreaterThan(0);
    });
  });

  describe('Tags', () => {
    test('should have tags defined', () => {
      expect(openApiSpec.tags).toBeDefined();
      expect(Array.isArray(openApiSpec.tags)).toBe(true);
    });

    test('should have Grammar tag', () => {
      const grammarTag = openApiSpec.tags.find(tag => tag.name === 'Grammar');
      expect(grammarTag).toBeDefined();
      expect(grammarTag.description).toBeDefined();
    });
  });
});
