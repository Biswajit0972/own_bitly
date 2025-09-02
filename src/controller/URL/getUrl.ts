import {Request, Response} from "express";
import {eq} from "drizzle-orm";
import {asyncHandler} from "../../utils/asyncHandler.ts";
import {AppError} from "../../utils/AppError.ts";
import db from "../../db/databaseConnection.ts";
import {shortUrlSchema} from "../../db/models/shortUrl.schema.ts";
import {AppResponse} from "../../utils/AppResponse.ts";

export const getUrl = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.id) {
        throw new AppError(401, "User not authorized for this operation");
    }

    const {shortCode} = req.params;

    const result = await db
        .select({
            id: shortUrlSchema.id,
            shortCode: shortUrlSchema.short_urlID,
            long_url: shortUrlSchema.long_url,
        })
        .from(shortUrlSchema)
        .where(eq(shortUrlSchema.short_urlID, shortCode))
        .limit(1);

    if (result.length === 0) {
        throw new AppError(404, "Short URL not found");
    }

    return res
        .status(200)
        .json(new AppResponse("Short URL retrieved successfully", result[0], 200));
});