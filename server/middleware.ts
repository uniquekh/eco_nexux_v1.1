import { Request, Response, NextFunction } from "express";
import type { User } from "@shared/schema";

declare module "express-session" {
  interface SessionData {
    userId: number;
    userRole: string;
  }
}

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.userId || !req.session.userRole) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    if (!roles.includes(req.session.userRole)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    
    next();
  };
}

export function requireCompany(req: Request, res: Response, next: NextFunction) {
  return requireRole("company")(req, res, next);
}

export function requireCustomer(req: Request, res: Response, next: NextFunction) {
  return requireRole("customer")(req, res, next);
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  return requireRole("admin")(req, res, next);
}
