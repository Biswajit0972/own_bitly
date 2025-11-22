import * as z from "zod";

import {loginSchema, shortenSchema, urlSchema, userSchema} from "../zod/zodTypes.ts";
import {JwtPayload} from "jsonwebtoken";
import {Request, Response,NextFunction} from "express";

export type User = z.infer<typeof userSchema>;
export type UserLogin = z.infer<typeof loginSchema>;
export type UrlBody= z.infer<typeof shortenSchema>;
export type ShortCode = z.infer<typeof urlSchema>;

export interface Authentication {
    getJwtSecret: () => string;
    extractTokenFromHeader: (req: Request) => string | undefined | null;
    verifyToken: (req: Request) => JwtPayload | null;
    authenticateRequest: (req: Request, res: Response, next: NextFunction) => Response | NextFunction | void;
    revalidateToken: (req: Request, res: Response, next: NextFunction) => Response | NextFunction | void;
}