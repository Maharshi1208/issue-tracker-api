// src/openapi.ts
const openapi = {
  openapi: '3.0.3',
  info: {
    title: 'Issue Tracker API',
    version: '1.0.0',
    description:
      'A minimal Issue Tracker API built with TypeScript, Express, and SQLite. Endpoints for creating, listing, updating, and deleting issues.',
  },
  servers: [
    { url: 'http://localhost:3000', description: 'Local dev server' }
  ],
  tags: [{ name: 'Issues' }],
  paths: {
    '/health': {
      get: {
        summary: 'Health check',
        responses: {
          '200': {
            description: 'OK',
            content: { 'application/json': { schema: { type: 'object', properties: { ok: { type: 'boolean' } } } } }
          }
        }
      }
    },
    '/api/issues': {
      get: {
        tags: ['Issues'],
        summary: 'List issues',
        responses: {
          '200': {
            description: 'List of issues',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Issue' } }
              }
            }
          }
        }
      },
      post: {
        tags: ['Issues'],
        summary: 'Create an issue',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateIssueInput' },
              examples: {
                Example: {
                  value: { title: 'Sample bug', description: 'Steps to reproduce...', priority: 1 }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Created issue',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Issue' } } }
          },
          '400': { description: 'Validation error' }
        }
      }
    },
    '/api/issues/{id}': {
      get: {
        tags: ['Issues'],
        summary: 'Get issue by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': { description: 'Issue', content: { 'application/json': { schema: { $ref: '#/components/schemas/Issue' } } } },
          '404': { description: 'Not found' }
        }
      },
      patch: {
        tags: ['Issues'],
        summary: 'Update an issue',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateIssueInput' },
              examples: {
                Example: {
                  value: { status: 'in_progress', title: 'Sample bug (working)' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Updated issue', content: { 'application/json': { schema: { $ref: '#/components/schemas/Issue' } } } },
          '400': { description: 'Validation error' },
          '404': { description: 'Not found' }
        }
      },
      delete: {
        tags: ['Issues'],
        summary: 'Delete an issue',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '204': { description: 'Deleted' },
          '404': { description: 'Not found' }
        }
      }
    }
  },
  components: {
    schemas: {
      Issue: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          title: { type: 'string' },
          description: { type: 'string' },
          status: { type: 'string', enum: ['open', 'in_progress', 'done'] },
          priority: { type: 'integer', enum: [1, 2, 3] },
          created_at: { type: 'string' },
          updated_at: { type: 'string' }
        },
        required: ['id', 'title', 'status', 'priority', 'created_at', 'updated_at']
      },
      CreateIssueInput: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          priority: { type: 'integer', enum: [1, 2, 3], default: 2 }
        },
        required: ['title']
      },
      UpdateIssueInput: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          status: { type: 'string', enum: ['open', 'in_progress', 'done'] },
          priority: { type: 'integer', enum: [1, 2, 3] }
        }
      }
    }
  }
} as const;

export default openapi;
