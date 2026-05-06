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
            address: { $ref: '#/components/schemas/Address' },
            email: { type: 'string', format: 'email' },
            notes: { type: 'string' },
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
            address: { $ref: '#/components/schemas/Address' },
            email: { type: 'string', format: 'email', example: 'contacto@proyecto.com' },
            notes: { type: 'string', example: 'Notas adicionales del proyecto' },
            client: { type: 'string', example: '64a1b2c3d4e5f6a7b8c9d0e1' }
          }
        },
        Worker: {
          type: 'object',
          required: ['name', 'hours'],
          properties: {
            name: { type: 'string', example: 'Juan García' },
            hours: { type: 'number', example: 8 }
          }
        },
        DeliveryNote: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            format: { type: 'string', enum: ['material', 'hours'] },
            description: { type: 'string' },
            workDate: { type: 'string', format: 'date' },
            material: { type: 'string' },
            quantity: { type: 'number' },
            unit: { type: 'string' },
            hours: { type: 'number' },
            workers: { type: 'array', items: { $ref: '#/components/schemas/Worker' } },
            client: { type: 'string' },
            project: { type: 'string' },
            signed: { type: 'boolean' },
            signedAt: { type: 'string', format: 'date-time' },
            signatureUrl: { type: 'string' },
            pdfUrl: { type: 'string' },
            deleted: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        DeliveryNoteInputMaterial: {
          type: 'object',
          required: ['format', 'material', 'quantity', 'unit', 'workDate', 'client', 'project'],
          properties: {
            format: { type: 'string', enum: ['material'] },
            description: { type: 'string', example: 'Entrega de materiales' },
            material: { type: 'string', example: 'Cemento' },
            quantity: { type: 'number', example: 10 },
            unit: { type: 'string', example: 'sacos' },
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
            description: { type: 'string', example: 'Jornada de trabajo' },
            hours: { type: 'number', example: 8 },
            workers: { type: 'array', items: { $ref: '#/components/schemas/Worker' } },
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
