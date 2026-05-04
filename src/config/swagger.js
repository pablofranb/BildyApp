import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BildyApp API',
      version: '1.0.0',
      description: 'API REST para gestión de clientes, proyectos y albaranes'
    },
    servers: [{ url: '/api' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            code: { type: 'string' }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            totalItems: { type: 'integer' },
            totalPages: { type: 'integer' },
            currentPage: { type: 'integer' },
            limit: { type: 'integer' }
          }
        },
        Address: {
          type: 'object',
          properties: {
            street: { type: 'string' },
            number: { type: 'string' },
            postal: { type: 'string' },
            city: { type: 'string' },
            province: { type: 'string' }
          }
        },
        Client: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            cif: { type: 'string' },
            address: { $ref: '#/components/schemas/Address' },
            phone: { type: 'string' },
            email: { type: 'string' },
            deleted: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        ClientInput: {
          type: 'object',
          required: ['name', 'cif'],
          properties: {
            name: { type: 'string', example: 'Empresa ABC' },
            cif: { type: 'string', example: 'B12345678' },
            address: { $ref: '#/components/schemas/Address' },
            phone: { type: 'string', example: '612345678' },
            email: { type: 'string', format: 'email', example: 'contacto@empresa.com' }
          }
        },
        Project: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            projectCode: { type: 'string' },
            description: { type: 'string' },
            client: { type: 'string' },
            active: { type: 'boolean' },
            deleted: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        ProjectInput: {
          type: 'object',
          required: ['name', 'projectCode', 'client'],
          properties: {
            name: { type: 'string', example: 'Reforma oficinas' },
            projectCode: { type: 'string', example: 'PRJ-001' },
            description: { type: 'string', example: 'Reforma completa de oficinas' },
            client: { type: 'string', example: '64a1b2c3d4e5f6a7b8c9d0e1' }
          }
        },
        DeliveryNoteItem: {
          type: 'object',
          required: ['material', 'quantity', 'unit'],
          properties: {
            material: { type: 'string', example: 'Cemento' },
            quantity: { type: 'number', example: 10 },
            unit: { type: 'string', example: 'sacos' }
          }
        },
        DeliveryNote: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            format: { type: 'string', enum: ['material', 'hours'] },
            items: { type: 'array', items: { $ref: '#/components/schemas/DeliveryNoteItem' } },
            hours: { type: 'number' },
            workers: { type: 'integer' },
            workDate: { type: 'string', format: 'date' },
            client: { type: 'string' },
            project: { type: 'string' },
            signed: { type: 'boolean' },
            signedAt: { type: 'string', format: 'date-time' },
            signatureUrl: { type: 'string' },
            pdfUrl: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        DeliveryNoteInputMaterial: {
          type: 'object',
          required: ['format', 'items', 'workDate', 'client', 'project'],
          properties: {
            format: { type: 'string', enum: ['material'] },
            items: { type: 'array', items: { $ref: '#/components/schemas/DeliveryNoteItem' }, minItems: 1 },
            workDate: { type: 'string', format: 'date', example: '2026-05-04' },
            client: { type: 'string', example: '64a1b2c3d4e5f6a7b8c9d0e1' },
            project: { type: 'string', example: '64a1b2c3d4e5f6a7b8c9d0e2' }
          }
        },
        DeliveryNoteInputHours: {
          type: 'object',
          required: ['format', 'workDate', 'client', 'project'],
          properties: {
            format: { type: 'string', enum: ['hours'] },
            hours: { type: 'number', example: 8 },
            workers: { type: 'integer', example: 3 },
            workDate: { type: 'string', format: 'date', example: '2026-05-04' },
            client: { type: 'string', example: '64a1b2c3d4e5f6a7b8c9d0e1' },
            project: { type: 'string', example: '64a1b2c3d4e5f6a7b8c9d0e2' }
          }
        },
        UserRegister: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', example: 'Pablo' },
            email: { type: 'string', format: 'email', example: 'pablo@empresa.com' },
            password: { type: 'string', format: 'password', example: 'MiPassword123' }
          }
        },
        UserLogin: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'pablo@empresa.com' },
            password: { type: 'string', format: 'password', example: 'MiPassword123' }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            user: { type: 'object' }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./src/routes/*.js']
};

export const swaggerSpec = swaggerJsdoc(options);
