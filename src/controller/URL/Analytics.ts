import {Request, Response} from "express";
import {eq, count} from "drizzle-orm";
import {asyncHandler} from "../../utils/asyncHandler.ts";
import {AppError} from "../../utils/AppError.ts";
import db from "../../db/databaseConnection.ts";
import {AppResponse} from "../../utils/AppResponse.ts";
import {ShortCode} from "../../utils/Types/types.ts";
import {clicks_on_short_urlsSchema} from "../../db/schema/clicks_on_short_urls.schema.ts";
import {shortUrlSchema} from "../../db/schema/shortUrl.schema.ts";

export const getAnalytics = asyncHandler(
    async (req: Request, res: Response) => {
        if (!req.user?.id) {
            throw new AppError(401, "User not authorized for this operation");
        }
        const {shortCode} = req.params as ShortCode;

        if (!shortCode) {
            throw new AppError(400, "Short code is required");
        }

        const rows = await db
            .select({
                shortUrl: shortUrlSchema,
                clickCount: count(clicks_on_short_urlsSchema.id),
            })
            .from(shortUrlSchema)
            .leftJoin(
                clicks_on_short_urlsSchema,
                eq(clicks_on_short_urlsSchema.short_url_id, shortUrlSchema.short_urlID),
            )
            .where(eq(shortUrlSchema.short_urlID, shortCode))
            .groupBy(shortUrlSchema.id);

        if (rows.length === 0) {
            throw new AppError(404, "Short URL not found");
        }

        const { shortUrl, clickCount } = rows[0];

        // Flatten the response: all shortUrl fields + clickCount
        res
            .status(200)
            .json(new AppResponse("Analytics retrieved successfully", { ...shortUrl, clickCount }, 200));
    }
)