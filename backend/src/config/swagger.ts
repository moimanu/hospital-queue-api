import swaggerJSDoc from "swagger-jsdoc";

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
        url: `${process.env.BACKEND_URL}/api`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT", // pode deixar JWT mesmo, mesmo usando token fixo
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"],
});
