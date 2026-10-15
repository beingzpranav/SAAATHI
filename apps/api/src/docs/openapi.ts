export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'SAATHI API',
    version: '1.0.0',
    description:
      'AI counselling platform backend for vocational training in India (Smart India Hackathon 2026, problem statement 262241).',
  },
  servers: [
    {
      url: '/api/v1',
      description: 'API v1 root',
    },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'saathi_access',
      },
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      UserProfile: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string', nullable: true },
          role: {
            type: 'string',
            enum: ['LEARNER', 'PARENT', 'COUNSELLOR', 'ADMINISTRATOR'],
          },
          language: { type: 'string', enum: ['en', 'hi'] },
          isMinor: { type: 'boolean' },
          parentConsentGiven: { type: 'boolean' },
          householdId: { type: 'string', format: 'uuid', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      ApiError: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
              details: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    field: { type: 'string' },
                    message: { type: 'string' },
                  },
                },
              },
              requestId: { type: 'string' },
            },
          },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        summary: 'Liveness check',
        responses: {
          '200': { description: 'Server is running' },
        },
      },
    },
    '/ready': {
      get: {
        summary: 'Readiness check',
        responses: {
          '200': { description: 'Dependencies ready' },
        },
      },
    },
    '/auth/register': {
      post: {
        summary: 'Register learner or parent with optional minor consent',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password', 'role'],
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  phone: { type: 'string' },
                  password: { type: 'string', minLength: 8 },
                  role: {
                    type: 'string',
                    enum: ['LEARNER', 'PARENT', 'COUNSELLOR', 'ADMINISTRATOR'],
                  },
                  language: { type: 'string', enum: ['en', 'hi'], default: 'en' },
                  isMinor: { type: 'boolean', default: false },
                  parentConsentGiven: { type: 'boolean', default: false },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'User successfully created' },
          '409': { description: 'Email already exists' },
          '422': { description: 'Validation failed' },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Log in with credentials',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Successfully authenticated' },
          '401': { description: 'Invalid credentials' },
        },
      },
    },
    '/auth/me': {
      get: {
        summary: 'Get current user profile',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        responses: {
          '200': { description: 'Current user profile' },
          '401': { description: 'Unauthorized' },
        },
      },
    },
  },
};
