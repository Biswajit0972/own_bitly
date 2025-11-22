import {Request, Response} from "express";
import {or, eq} from "drizzle-orm";
import bcrypt from "bcrypt";
import {asyncHandler} from "../../utils/asyncHandler";
import {AppError} from "../../utils/AppError";
import {User} from "../../utils/Types/types";
import db from "../../db/databaseConnection";
import {usersTable} from "../../db/schema/user.schema";
import {AppResponse} from "../../utils/AppResponse";

export const sign = asyncHandler(async (req: Request, res: Response) => {
    const {username, fullName, password, email} = req.body as User;

    const cleanUsername = username?.trim();
    const cleanFullName = fullName?.trim();
    const cleanEmail = email?.trim();

    if (!cleanUsername || !cleanFullName || !password || !cleanEmail) {
        throw new AppError(400, "Missing required fields");
    }

    const existing = await db
        .select()
        .from(usersTable)
        .where(
            or(eq(usersTable.username, cleanUsername), eq(usersTable.email, cleanEmail))
        );

    if (existing.length > 0) {
        throw new AppError(409, "Username or email already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user and return safe fields only
    const inserted = await db
        .insert(usersTable)
        .values({
            username: cleanUsername,
            fullName: cleanFullName,
            email: cleanEmail,
            password: hashedPassword,
        })
        .returning({
            id: usersTable.id,
            username: usersTable.username,
            fullName: usersTable.fullName,
            email: usersTable.email,
            createdAt: usersTable.createdAt,
        });

    if (!inserted || inserted.length === 0) {
        throw new AppError(500, "Internal server error");
    }

    const user = inserted[0];

    return res
        .status(201)
        .json(new AppResponse(true,"User created successfully", user, 201));
});