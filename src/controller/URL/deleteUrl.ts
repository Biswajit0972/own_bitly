import {Request, Response} from "express";
import {eq} from "drizzle-orm";
import {asyncHandler} from "../../utils/asyncHandler.ts";
import {AppError} from "../../utils/AppError.ts";
import db from "../../db/databaseConnection.ts";
import {shortUrlSchema} from "../../db/models/shortUrl.schema.ts";
import {AppResponse} from "../../utils/AppResponse.ts";


export const deleteUrl = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.id) {
        throw new AppError(401, "User not authorized for this operation");
    }

    const {id} = req.params;

    const result = await db
        .delete(shortUrlSchema)
        .where(eq(shortUrlSchema.short_urlID, id))
        .returning({
            id: shortUrlSchema.id,
            shortCode: shortUrlSchema.short_urlID,
            long_url: shortUrlSchema.long_url,
        });

    if (result.length === 0) {
        throw new AppError(404, "Short URL not found or already deleted");
    }

    return res
        .status(200)
        .json(new AppResponse("Short URL deleted successfully", result[0], 200));
});