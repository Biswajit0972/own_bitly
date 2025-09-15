import type { Request, Response, NextFunction, RequestHandler } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & { sub?: string; role?: string };
      token?: string;
    }
  }
}

type DecodedUser = JwtPayload & { sub?: string; role?: string };

function getJwtSecret(): string {
  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set in environment");
  }
  return secret;
}

function extractToken(req: Request): string | null {

  const authHeader = req.header("authorization") || req.header("Authorization");

  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring("Bearer ".length).trim();
  }


  const cookieToken =
    (req as any).cookies?.accessToken ||
    (req as any).cookies?.token ||
    (req as any).cookies;

  if (typeof cookieToken === "string" && cookieToken.length > 0) {
    return cookieToken;
  }

  if (process.env.NODE_ENV !== "production") {
    const queryToken = typeof req.query?.token === "string" ? (req.query.token as string) : null;
    if (queryToken) return queryToken;
  }

  return null;
}


const verifyToken = (req: Request): DecodedUser | null => {
  const token = extractToken(req);
  if (!token) return null;

  const secret = getJwtSecret();

  try {
    const decoded = jwt.verify(token, secret) as DecodedUser;
    req.user = decoded;
    req.token = token;
    return decoded;
  } catch {
    return null;
  }
};

/**
 * Authentication middleware that requires a valid token.
 * Responds with 401 Unauthorized if verification fails.
 */
export const authenticate: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({
      error: "unauthorized",
      message: "Authentication required",
    });
  }
  return next();
};

export const revalidateTokenAuth = (req: Request, res: Response, next: NextFunction) => {
  let refreshToken = req.header("x-refresh-token") || req.header("X-Refresh-Token");

  refreshToken = req.cookies?.refreshToken || refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      error: "unauthorized",
      message: "Refresh token required",
    });
  }

  try {
    const secret = process.env.REFRESH_TOKEN_SECRET || "";
    const decoded = jwt.verify(refreshToken, secret) as DecodedUser;
    req.user = decoded;
    req.token = refreshToken;
    return next();
  } catch {
    return res.status(401).json({
      error: "unauthorized",
      message: "Invalid refresh token",
    });
  }
}