import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "OnlyFitness API Documentation",
      version: "1.0.0",
      description: "API documentation for OnlyFitness",
      contact: {
        name: "OnlyFitness",
        url: "https://onlyfitness.com",
        email: "contact@onlyfitness.com",
      },
      license: {
        name: "MIT",
        url: "https://mit.com",
      },
    },
    servers: [
      {
        url: "http://localhost:5001",
        description: "Local Development Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: "Health", description: "Service health" },
      { name: "Auth", description: "Authentication routes" },
      { name: "Users", description: "User management routes" },
      { name: "Exercises", description: "Exercise management routes" },
      { name: "Templates", description: "Template management routes" },
      { name: "Programs", description: "Program management routes" },
      { name: "Sessions", description: "Session management routes" },
    ],
    paths: {
      "/health": {
        get: {
          tags: ["Health"],
          summary: "Health check",
          security: [],
          responses: {
            "200": {
              description: "Service OK",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string", example: "ok" },
                      uptime: { type: "number" },
                      timestamp: { type: "number" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [
    `${import.meta.dirname}/../features/**/*.routes.ts`,
    `${import.meta.dirname}/../features/**/*.routes.js`,
  ],
};

export const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
