import {Request, Response} from "express";
import {eq} from "drizzle-orm";
import {asyncHandler} from "../../utils/asyncHandler.ts";
import {AppError} from "../../utils/AppError.ts";
import db from "../../db/databaseConnection.ts";
import {shortUrlSchema} from "../../db/models/shortUrl.schema.ts";
import {AppResponse} from "../../utils/AppResponse.ts";



export const getAllUrls = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.id) {
        throw new AppError(401, "User not authorized for this operation");
    }

    const result = await db
        .select()
        .from(shortUrlSchema)
        .where(eq(shortUrlSchema.user_id, req.user?.id));

    if (result.length === 0) {
        throw new AppError(404, "Short URL not found");
    }

    return res
        .status(200)
        .json(new AppResponse("Short URL retrieved successfully", result, 200));
})