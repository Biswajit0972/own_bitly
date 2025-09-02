import { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { asyncHandler } from "../../utils/asyncHandler.ts";
import { AppError } from "../../utils/AppError.ts";
import db from "../../db/databaseConnection.ts";
import { shortUrlSchema } from "../../db/models/shortUrl.schema.ts";
import { AppResponse } from "../../utils/AppResponse.ts";
import { UrlBody } from "../../utils/Types/types.ts";

export const updateUrl = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.id) {
        throw new AppError(401, "User not authorized for this operation");
    }

    const { shortCode } = req.params;

    const { url } = req.body as UrlBody;

    if (!url) {
        throw new AppError(400, "At least one field (url or shortCode) must be provided");
    }


    const result = await db
        .update(shortUrlSchema)
        .set({
            long_url: url,
        })
        .where(eq(shortUrlSchema.short_urlID, shortCode))
        .returning({
            id: shortUrlSchema.id,
            shortCode: shortUrlSchema.short_urlID,
            long_url: shortUrlSchema.long_url,
        });

    if (result.length === 0) {
        throw new AppError(404, "Short URL not found or update failed");
    }

    return res
        .status(200)
        .json(new AppResponse("Short URL updated successfully", result[0], 200));
});
