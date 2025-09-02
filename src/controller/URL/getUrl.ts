import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { AppError } from "../../utils/AppError";
import db from "../../db/databaseConnection";
import { shortUrlSchema } from "../../db/models/shortUrl.schema";
import { eq } from "drizzle-orm";
import { ShortCode } from "../../utils/Types/types";

export const getUrl = asyncHandler(async (req: Request, res: Response) => {
    const { shortCode } = req.params as ShortCode;


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

    let targetUrl = result[0].long_url;


    if (!/^https?:\/\//i.test(targetUrl)) {
        targetUrl = `https://${targetUrl}`;
    }
    return res.redirect(targetUrl);
});
