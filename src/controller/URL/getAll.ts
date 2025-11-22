import {Request, Response} from "express";
import {count, eq} from "drizzle-orm";
import {asyncHandler} from "../../utils/asyncHandler.ts";
import {AppError} from "../../utils/AppError.ts";
import db from "../../db/databaseConnection.ts";
import {shortUrlSchema} from "../../db/schema/shortUrl.schema.ts";
import {AppResponse} from "../../utils/AppResponse.ts";
import {clicks_on_short_urlsSchema} from "../../db/schema/clicks_on_short_urls.schema.ts";
import {client} from "../../redis/client.ts";


export const getAllUrls = asyncHandler(async (req: Request, res: Response) => {

    const limit = parseInt(req.query.limit as string) || 10;
    const page = parseInt(req.query.page as string) || 1;
    const offset = (page - 1) * limit;

    if (!req.user?.id) {
        throw new AppError(401, "User not authorized for this operation");
    }

    const userId = req.user.id;

    // Better caching key
    const cacheKey = `user:${userId}:urls:limit=${limit}:page=${page}`;

    // Get from cache
    const cached = await client.json.get(cacheKey );

    if (cached ) {
        return res
            .status(200)
            .json(new AppResponse(true,"Short URLs retrieved (cache)", cached, 200));
    }

    // ------------ Query DB --------------- //
    const [result, totalCount] = await Promise.all([
        db
            .select({
                id: shortUrlSchema.id,
                shortCode: shortUrlSchema.shortCode,
                longUrl: shortUrlSchema.long_url,
                title: shortUrlSchema.title,
                clicksCount: count(clicks_on_short_urlsSchema.id),
                createdAt: shortUrlSchema.createdAt,
                user_id: shortUrlSchema.user_id
            })
            .from(shortUrlSchema)
            .leftJoin(
                clicks_on_short_urlsSchema,
                eq(clicks_on_short_urlsSchema.shortUrlId, shortUrlSchema.shortCode)
            )
            .where(eq(shortUrlSchema.user_id, userId))
            .groupBy(
                shortUrlSchema.id,
                shortUrlSchema.shortCode,
                shortUrlSchema.long_url,
                shortUrlSchema.title
            )
            .limit(limit)
            .offset(offset),

        // For pagination metadata
        db
            .select({ count: count(shortUrlSchema.id) })
            .from(shortUrlSchema)
            .where(eq(shortUrlSchema.user_id, userId))
            .then(r => Number(r[0].count))
    ]);

    const responseData = {
        data: result,
        pagination: {
            totalItems: totalCount,
            page,
            limit,
            totalPages: Math.ceil(totalCount / limit)
        }
    };

    // Cache for 60 seconds
    await client.json.set(cacheKey, "$", responseData);
    await client.expire(cacheKey, 60);

    return res
        .status(200)
        .json(new AppResponse(true,"Short URLs retrieved successfully", responseData, 200));
});
