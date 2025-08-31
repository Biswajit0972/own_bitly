import {NextFunction, Request, Response} from "express";
import {AppError} from "./AppError.ts";

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<Response>;

export const asyncHandler = (fn: AsyncHandler) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<Response> => {

        try {
            return await fn(req, res, next);
        } catch (error) {
            if (error instanceof AppError) {
                console.log(error.message)

                return res.status(error.statusCode || 500).json({message: error.message || "Something went wrong"});
            }

            if (error instanceof Error) {
                console.log(error.message)
                return res.status(500).json({message: error.message || "Something went wrong"});
            }

            return res.status(500).json({message: "unSomething went wrong"});
        }
    }
}