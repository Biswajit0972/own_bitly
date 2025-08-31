import { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { asyncHandler } from "../../utils/asyncHandler";
import { AppError } from "../../utils/AppError";
import db from "../../db/databaseConnection";
import { usersTable } from "../../db/models/user.schema";
import { AppResponse } from "../../utils/AppResponse";

export const userProfile = asyncHandler(async (req: Request, res: Response) => {
    const id = req.user?.id;

    if (!id) {
        throw new AppError(400, "User ID is missing from request");
    }

    // Select only safe fields (exclude password)
    const user = await db
        .select({
            id: usersTable.id,
            username: usersTable.username,
            email: usersTable.email,
            fullName: usersTable.fullName,
            createdAt: usersTable.createdAt,
        })
        .from(usersTable)
        .where(eq(usersTable.id, id));

    if (!user || user.length === 0) {
        throw new AppError(404, "User not found");
    }

    return res
        .status(200)
        .json(new AppResponse( "User profile fetched successfully", user[0],  200));
});
