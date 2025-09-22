import "dotenv/config";
import swaggerJSDoc from "swagger-jsdoc";

const backendUrl = process.env.BACKEND_URL || "http://localhost:3000";

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Hospital Queue API",
      version: "1.0.0",
      description: "REST API for patient log management",
    },
    servers: [
      {
        url: `${backendUrl}/api`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"],
});
