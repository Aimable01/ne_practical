import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Fire Extinguisher Management System API',
      version: '1.0.0',
      description: 'A comprehensive API for managing fire extinguishers, inspections, and maintenance activities',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string'
            },
            firstName: {
              type: 'string'
            },
            lastName: {
              type: 'string'
            },
            email: {
              type: 'string',
              format: 'email'
            },
            role: {
              type: 'string',
              enum: ['ADMIN', 'INSPECTOR', 'USER']
            }
          }
        },
        Extinguisher: {
          type: 'object',
          properties: {
            id: {
              type: 'string'
            },
            serialNumber: {
              type: 'string'
            },
            location: {
              type: 'string'
            },
            type: {
              type: 'string',
              enum: ['WATER', 'CO2', 'FOAM', 'DRY_CHEMICAL']
            },
            size: {
              type: 'string',
              enum: ['2.5lbs', '5lbs', '9lbs', '12lbs']
            },
            installationDate: {
              type: 'string',
              format: 'date'
            },
            expiryDate: {
              type: 'string',
              format: 'date'
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'EXPIRED', 'MAINTENANCE_REQUIRED', 'OUT_OF_SERVICE']
            }
          }
        },
        Inspection: {
          type: 'object',
          properties: {
            id: {
              type: 'string'
            },
            extinguisherId: {
              type: 'string'
            },
            scheduledDate: {
              type: 'string',
              format: 'date'
            },
            scheduledTime: {
              type: 'string'
            },
            inspectorId: {
              type: 'string'
            },
            status: {
              type: 'string',
              enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED', 'FAILED']
            },
            result: {
              type: 'string'
            },
            notes: {
              type: 'string'
            }
          }
        },
        Maintenance: {
          type: 'object',
          properties: {
            id: {
              type: 'string'
            },
            extinguisherId: {
              type: 'string'
            },
            inspectorId: {
              type: 'string'
            },
            actionsTaken: {
              type: 'string'
            },
            dateOfAction: {
              type: 'string',
              format: 'date'
            },
            conditionsNoted: {
              type: 'string'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string'
            },
            details: {
              type: 'array',
              items: {
                type: 'object'
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints'
      },
      {
        name: 'Extinguishers',
        description: 'Fire extinguisher management endpoints'
      },
      {
        name: 'Inspections',
        description: 'Inspection scheduling and management endpoints'
      },
      {
        name: 'Maintenance',
        description: 'Maintenance logging and tracking endpoints'
      },
      {
        name: 'Reports',
        description: 'Reporting and analytics endpoints'
      }
    ]
  },
  apis: ['./src/routes/*.ts']
};

export const swaggerSpec = swaggerJsdoc(options);
