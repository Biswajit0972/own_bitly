import { Request, Response } from "express";
import { and, eq } from "drizzle-orm";
import { asyncHandler } from "../../utils/asyncHandler.ts";
import { AppError } from "../../utils/AppError.ts";
import db from "../../db/databaseConnection.ts";
import { shortUrlSchema } from "../../db/schema/shortUrl.schema.ts";
import { AppResponse } from "../../utils/AppResponse.ts";
import { ShortCode } from "../../utils/Types/types.ts";
import { client } from "../../redis/client.ts";


export const deleteUrl = asyncHandler(async (req: Request, res: Response) => {

    const { shortCode } = req.params as ShortCode;
    if (!req.user?.id) {
        throw new AppError(401, "User not authorized");
    }
    const result = await db
        .delete(shortUrlSchema)
        .where(and(
                eq(shortUrlSchema.shortCode, shortCode),
                eq(shortUrlSchema.user_id, req.user.id)
            ))
        .returning({
            id: shortUrlSchema.id,
            shortCode: shortUrlSchema.shortCode,
            long_url: shortUrlSchema.long_url,
        });

    if (result.length === 0) {
        throw new AppError(404, "Short URL not found or already deleted");
    }

    const checkIsCached = await client.json.get(shortCode);
    if (checkIsCached)
    await client.json.del(shortCode);

    return res
        .status(200)
        .json(new AppResponse(true, "Short URL deleted successfully", result[0], 200));
});