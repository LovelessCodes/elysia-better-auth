import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { type Context, Elysia } from "elysia";
import { auth } from "./auth";
import { z } from "zod";

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];

const betterAuthView = (context: Context) => {
	const BETTER_AUTH_ACCEPT_METHODS = ["POST", "GET"];
	// validate request method
	if (BETTER_AUTH_ACCEPT_METHODS.includes(context.request.method)) {
		return auth.handler(context.request);
	}
	context.error(405);
};

const validateOrigin = (request: Request) => {
	const origin = request.headers.get("origin") || "";
	if (allowedOrigins.includes(origin)) {
		return true;
	}
	return false;
};

const app = new Elysia()
	.use(
		cors({
			origin: validateOrigin,
			allowedHeaders: ["Content-Type", "Authorization"],
			methods: ["POST", "GET", "OPTIONS"],
			exposeHeaders: ["Content-Length"],
			maxAge: 600,
			credentials: true,
		}),
	)
	.use(swagger({
    documentation: {
      info: {
        title: "Elysia x Better Auth",
        version: "0.0.1",
        description: "An example of Elysia x Better Auth",
      },
      tags: [
        { name: 'App', description: 'General endpoints' },
      ]
    },
  }))
  .get("/", () => "Hello Elysia x Better Auth! 🦊", {
    detail: {
      tags: ["App"],
      responses: {
        200: {
          description: "Hello response",
          content: {
            "text/plain": {
              example: "Hello Elysia x Better Auth! 🦊",
            },
          },
        },
      },
    },
  })
	.all("/api/auth/*", betterAuthView)
	.listen(3131);

console.log(
	`🦊 Elysia x Better Auth is running at ${app.server?.hostname}:${app.server?.port}`,
);
