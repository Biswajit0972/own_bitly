import {Request, Response} from "express";

import {asyncHandler} from "../../utils/asyncHandler.ts";
import {AppError} from "../../utils/AppError.ts";
import {UrlBody} from "../../utils/Types/types.ts";
import {nanoid} from "nanoid";
import db from "../../db/databaseConnection.ts";
import {shortUrlSchema} from "../../db/schema/shortUrl.schema.ts";
import {AppResponse} from "../../utils/AppResponse.ts";

export const urlShort = asyncHandler(async (req: Request, res:Response) => {
    if (!req.user?.id) {
        throw new AppError(400, "user authorized to this operation");
    }

    const {url, shortCode, tittle} = req.body as UrlBody;

    if (!url) {
        throw new AppError(400, "Url must be provided!")
    }

    const newShortCode = shortCode || nanoid(6);

    const result = await db.insert(shortUrlSchema).values({
        shortCode: newShortCode,
        long_url: url,
        user_id: req.user?.id,
        title: tittle,
    }).returning({
        id: shortUrlSchema.id,
        shortCode: shortUrlSchema.shortCode,
        long_url: shortUrlSchema.long_url,
        title: shortUrlSchema.title,
        expirationDate: shortUrlSchema.expirationDate
    });

    if (!result[0].id || result.length === 0) {
        throw new AppError(500, "Something went's wrong while creating shortcode")
    }

    return res.status(201).json(new AppResponse(true,"Shortcode created successfully", result[0], 201));
})