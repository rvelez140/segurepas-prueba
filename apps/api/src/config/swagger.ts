import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SecurePass API',
      version: '1.0.0',
      description: 'API para el sistema de gestión de visitas y control de acceso SecurePass',
      contact: {
        name: 'API Support',
        email: 'support@securepass.com',
      },
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:8000',
        description: 'Servidor de desarrollo',
      },
      {
        url: process.env.PRODUCTION_API_URL || 'https://api.securepass.com',
        description: 'Servidor de producción',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Ingrese el token JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'error',
            },
            message: {
              type: 'string',
              example: 'Mensaje de error',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            name: {
              type: 'string',
              example: 'Juan Pérez',
            },
            email: {
              type: 'string',
              example: 'juan@example.com',
            },
            role: {
              type: 'string',
              enum: ['admin', 'resident', 'guard'],
              example: 'resident',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Visit: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            visitorName: {
              type: 'string',
              example: 'María García',
            },
            visitorDocument: {
              type: 'string',
              example: '12345678',
            },
            residentId: {
              type: 'string',
              example: '507f1f77bcf86cd799439012',
            },
            visitDate: {
              type: 'string',
              format: 'date-time',
            },
            status: {
              type: 'string',
              enum: ['pending', 'approved', 'rejected', 'completed'],
              example: 'approved',
            },
            vehiclePlate: {
              type: 'string',
              example: 'ABC123',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  // Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // JSON spec
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log('📚 Swagger documentation available at /api-docs');
};

export default swaggerSpec;
