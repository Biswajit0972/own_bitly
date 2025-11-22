import type {Request, Response, NextFunction, RequestHandler} from "express";
import jwt, {type JwtPayload} from "jsonwebtoken";
import {Authentication} from "../utils/Types/types.ts";

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload & { sub?: string; role?: string };
            token?: string;
        }
    }
}

type DecodedUser = JwtPayload & { sub?: string; role?: string };


export class AuthenticationHelper implements Authentication {
     getJwtSecret(): string {
        const secret = process.env.ACCESS_TOKEN_SECRET;
        if (!secret) {
            throw new Error("JWT_SECRET is not set in environment");
        }
        return secret;
    }

     extractTokenFromHeader(req: Request) {
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

     verifyToken(req: Request) {
        const token = this.extractTokenFromHeader(req);
        if (!token) return null;

        const secret = this.getJwtSecret();

        try {
            const decoded = jwt.verify(token, secret) as DecodedUser;
            req.user = decoded;
            req.token = token;
            return decoded;
        } catch {
            return null;
        }
    }

    authenticateRequest = (req: Request, res: Response, next: NextFunction) => {
        const user = this.verifyToken(req);
        if (!user) {
            return res.status(401).json({
                error: "unauthorized",
                message: "Authentication required",
            });
        }
        return next();
    };

    revalidateToken (req: Request, res: Response, next: NextFunction) {
        let refreshToken = req.header("x-refresh-token") || req.header("X-Refresh-Token") || req.cookies?.refreshToken || req.cookies?.token;

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
        }catch (error) {
            return res.status(401).json({
                error: "unauthorized",
                message: "Invalid refresh token",
            });
        }
    }
}