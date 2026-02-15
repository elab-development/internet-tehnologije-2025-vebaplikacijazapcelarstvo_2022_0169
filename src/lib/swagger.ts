import swaggerJSDoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Veb pčelarstvo API",
      version: "1.0.0",
      description: "OpenAPI specifikacija za backend rute (Next.js App Router).",
    },
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "auth", 
        },
      },
    },
    
    security: [{ cookieAuth: [] }],
  },
  apis: ["./src/app/api/**/*.ts"],
});
