import { Request, Response } from "express";
import { eq, and, ne } from "drizzle-orm";
import { asyncHandler } from "../../utils/asyncHandler";
import { AppError } from "../../utils/AppError";
import db from "../../db/databaseConnection";
import { usersTable } from "../../db/models/user.schema";
import { AppResponse } from "../../utils/AppResponse";

export const updateUserProfile = asyncHandler(async (req: Request, res: Response) => {
    const id = req.user?.id;

    if (!id) {
        throw new AppError(400, "User ID is missing from request");
    }

    const { fullName, email } = req.body;

    if (!fullName && !email) {
        throw new AppError(400, "Please provide at least one field to update");
    }

    // If email is being updated, check if it's already taken
    if (email) {
        const existingUser = await db
            .select()
            .from(usersTable)
            .where(and(eq(usersTable.email, email), ne(usersTable.id, id)));

        if (existingUser.length > 0) {
            throw new AppError(400, "Email is already in use by another account");
        }
    }

    // Perform update
    await db
        .update(usersTable)
        .set({
            ...(fullName && { fullName: fullName }),
            ...(email && { email }),
            updatedAt: new Date(),
        })
        .where(eq(usersTable.id, id));

    // Fetch updated user (safe fields only)
    const updatedUser = await db
        .select({
            id: usersTable.id,
            fullName: usersTable.fullName,
            email: usersTable.email,
            createdAt: usersTable.createdAt,
            updatedAt: usersTable.updatedAt,
        })
        .from(usersTable)
        .where(eq(usersTable.id, id));

    return res
        .status(200)
        .json(new AppResponse( "User profile updated successfully", updatedUser[0], 201));
});
