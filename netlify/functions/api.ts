import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import serverless from "serverless-http";
import { registerRoutes } from "../../server/routes";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session configuration for Netlify
app.use(
  session({
    secret: process.env.SESSION_SECRET || "circular-chain-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true, // Always true in production
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
  })
);

// Initialize routes
let routesInitialized = false;
const initializeRoutes = async () => {
  if (!routesInitialized) {
    await registerRoutes(app);
    routesInitialized = true;
  }
};

// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

// Export as serverless function with lazy initialization
const serverlessHandler = serverless(app);

export const handler = async (event: any, context: any) => {
  await initializeRoutes();
  return serverlessHandler(event, context);
};
