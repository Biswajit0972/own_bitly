import {Request, Response} from "express";
import {count, eq} from "drizzle-orm";
import {asyncHandler} from "../../utils/asyncHandler.ts";
import {AppError} from "../../utils/AppError.ts";
import db from "../../db/databaseConnection.ts";
import {shortUrlSchema} from "../../db/models/shortUrl.schema.ts";
import {AppResponse} from "../../utils/AppResponse.ts";
import {clicks_on_short_urlsSchema} from "../../db/models/clicks_on_short_urls.schema.ts";


export const getAllUrls = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.id) {
        throw new AppError(401, "User not authorized for this operation");
    }

    const result = await db
        .select({
            id: shortUrlSchema.id,
            shortUrlID: shortUrlSchema.short_urlID,
            longUrl: shortUrlSchema.long_url,
            title: shortUrlSchema.tittle,
            clicksCount: count(clicks_on_short_urlsSchema.id),
            createdAt: shortUrlSchema.createdAt,
            user_id: shortUrlSchema.user_id
        })
        .from(shortUrlSchema)
        .leftJoin(
            clicks_on_short_urlsSchema,
            eq(clicks_on_short_urlsSchema.short_url_id, shortUrlSchema.short_urlID)
        )
        .where(eq(shortUrlSchema.user_id, req.user?.id))
        .groupBy(
            shortUrlSchema.id,
            shortUrlSchema.short_urlID,
            shortUrlSchema.long_url,
            shortUrlSchema.tittle
        );

    if (result.length === 0) {
        throw new AppError(404, "Short URL not found");
    }

    console.log(result);

    return res
        .status(200)
        .json(new AppResponse("Short URL retrieved successfully", result, 200));
})