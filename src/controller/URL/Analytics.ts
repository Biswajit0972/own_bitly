import {Request, Response} from "express";
import {eq} from "drizzle-orm";
import {asyncHandler} from "../../utils/asyncHandler.ts";
import {AppError} from "../../utils/AppError.ts";
import db from "../../db/databaseConnection.ts";
import {AppResponse} from "../../utils/AppResponse.ts";
import {ShortCode} from "../../utils/Types/types.ts";
import {clicks_on_short_urlsSchema} from "../../db/models/clicks_on_short_urls.schema.ts";

export const getAnalytics = asyncHandler(
    async (req: Request, res: Response) => {
        if (!req.user?.id) {
            throw new AppError(401, "User not authorized for this operation");
        }
        const {shortCode} = req.params as ShortCode;

        if (!shortCode) {
            throw new AppError(400, "Short code is required");
        }

        const data = await db.select().from(clicks_on_short_urlsSchema).where(eq(clicks_on_short_urlsSchema.short_url_id, shortCode)).$dynamic();

        res.status(200).json(new AppResponse("Analytics retrieved successfully", data, 200));
    }
)