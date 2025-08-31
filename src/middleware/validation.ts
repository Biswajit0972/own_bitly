import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

export function validate<T extends z.ZodType>(schema: T) {
    return (
        req: Request<unknown, unknown, z.output<T>>, // infer body type from schema's output
        res: Response,
        next: NextFunction
    ) => {
        try {
            req.body = schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    error: "Validation failed",
                    details: (error as ZodError).message,
                });
            }
            return res.status(500).json({ error: "Unknown error" });
        }
    };
}
