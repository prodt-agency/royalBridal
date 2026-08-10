import { Router } from "express";

const router = Router();
const success = {
  type: "object",
  properties: {
    success: { type: "boolean" },
    message: { type: "string" },
    data: { type: "object" },
  },
};
const protectedResponses = {
  200: {
    description: "Success",
    content: { "application/json": { schema: success } },
  },
  401: { description: "Unauthenticated" },
  403: { description: "Forbidden" },
  422: { description: "Validation failure" },
};
const secured = (summary) => ({
  summary,
  security: [{ bearerAuth: [] }],
  responses: protectedResponses,
});
const document = {
  openapi: "3.0.3",
  info: { title: "Royal Bridal API", version: "1.0.0" },
  paths: {
    "/api/health": {
      get: {
        summary: "Health check",
        responses: {
          200: {
            description: "Healthy",
            content: { "application/json": { schema: success } },
          },
        },
      },
    },
    "/api/admin/login": {
      post: {
        summary: "Admin login",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string", format: "password" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Authenticated",
            content: { "application/json": { schema: success } },
          },
          401: { description: "Invalid credentials" },
          422: { description: "Validation failure" },
          429: { description: "Rate limited" },
        },
      },
    },
    "/api/admin/logout": { post: secured("Logout current admin session") },
    "/api/admin/logout-all": { post: secured("Logout every admin session") },
    "/api/admin/refresh": {
      post: {
        summary: "Rotate refresh token",
        responses: {
          200: {
            description: "Session refreshed",
            content: { "application/json": { schema: success } },
          },
          401: { description: "Invalid session" },
        },
      },
    },
    "/api/admin/me": { get: secured("Get current admin profile") },
    "/api/categories": {
      get: {
        summary: "List active categories",
        responses: {
          200: {
            description: "Category list",
            content: { "application/json": { schema: success } },
          },
        },
      },
      post: secured("Create category"),
    },
    "/api/categories/{id}": {
      patch: secured("Update category"),
      delete: secured("Delete category"),
    },
    "/api/products": {
      get: {
        summary: "Search and paginate products",
        parameters: [
          "page",
          "limit",
          "search",
          "sort",
          "order",
          "category",
          "featured",
          "active",
          "size",
          "minPrice",
          "maxPrice",
        ].map((name) => ({ name, in: "query", schema: { type: "string" } })),
        responses: {
          200: {
            description: "Paginated products",
            content: { "application/json": { schema: success } },
          },
        },
      },
      post: secured("Create product"),
    },
    "/api/products/{slug}": {
      get: {
        summary: "Get product details",
        responses: {
          200: {
            description: "Product",
            content: { "application/json": { schema: success } },
          },
          404: { description: "Not found" },
        },
      },
    },
    "/api/products/{id}": {
      patch: secured("Update product"),
      delete: secured("Soft delete product"),
    },
    "/api/products/{id}/restore": { post: secured("Restore product") },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
  },
};
router.get("/", (req, res) => res.status(200).json(document));
export default router;
