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
          language: { type: 'string', enum: ['en', 'hi', 'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml'] },
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
                  language: {
                    type: 'string',
                    enum: ['en', 'hi', 'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml'],
                    default: 'en',
                  },
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
    '/locations/states': {
      get: {
        summary: 'List available states',
        responses: {
          '200': { description: 'List of states' },
        },
      },
    },
    '/locations/districts': {
      get: {
        summary: 'List districts by state',
        parameters: [
          {
            name: 'state',
            in: 'query',
            required: false,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': { description: 'List of districts' },
        },
      },
    },
    '/locations/blocks': {
      get: {
        summary: 'List blocks by district',
        parameters: [
          {
            name: 'district',
            in: 'query',
            required: false,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': { description: 'List of blocks' },
        },
      },
    },
    '/households': {
      get: {
        summary: 'Get current household intake',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        responses: {
          '200': { description: 'Household intake summary with cost framing' },
          '404': { description: 'Intake not yet completed' },
        },
      },
      post: {
        summary: 'Submit or update household intake',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'state', 'district', 'block', 'incomeBand', 'learnerClassLevel'],
                properties: {
                  name: { type: 'string' },
                  state: { type: 'string' },
                  district: { type: 'string' },
                  block: { type: 'string' },
                  incomeBand: {
                    type: 'string',
                    enum: ['BELOW_1_5L', '1_5L_TO_3L', '3L_TO_5L', 'ABOVE_5L'],
                  },
                  learnerClassLevel: {
                    type: 'string',
                    enum: ['CLASS_8_PASS', 'CLASS_10_PASS', 'CLASS_12_PASS', 'GRADUATE'],
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Household intake recorded' },
          '422': { description: 'Validation error' },
        },
      },
    },
    '/trades': {
      get: {
        summary: 'List vocational trades with optional filtering',
        parameters: [
          { name: 'minEducation', in: 'query', schema: { type: 'string' } },
          { name: 'sector', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'List of vocational trades' },
        },
      },
    },
    '/trades/{code}': {
      get: {
        summary: 'Get trade details with NSQF ladder and approved providers',
        parameters: [
          { name: 'code', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'classLevel', in: 'query', required: false, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Trade detail' },
          '404': { description: 'Trade not found' },
        },
      },
    },
    '/trades/{code}/outcomes': {
      get: {
        summary: 'Retrieve verified outcome record with fallback ladder resolution',
        parameters: [
          { name: 'code', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'state', in: 'query', required: true, schema: { type: 'string' } },
          { name: 'district', in: 'query', required: false, schema: { type: 'string' } },
          { name: 'block', in: 'query', required: false, schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: 'Verified outcome response with confidence and fallback transparency',
          },
        },
      },
    },
  },
};
