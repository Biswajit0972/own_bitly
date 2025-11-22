import {Request, Response} from "express";
import {or, eq} from "drizzle-orm";
import {asyncHandler} from "../../utils/asyncHandler";
import {AppError} from "../../utils/AppError";
import {UserLogin} from "../../utils/Types/types";
import db from "../../db/databaseConnection";
import {usersTable} from "../../db/schema/user.schema";
import {AppResponse} from "../../utils/AppResponse";
import {AuthenticationHelper} from "../../utils/helper/helper.ts";

const AuthHelper: AuthenticationHelper = new AuthenticationHelper();

export const login = asyncHandler(async (req: Request, res: Response) => {
    const {identifier, password} = req.body as UserLogin;

    const cleanIdentifier = identifier.trim();
    const cleanPassword = password.trim();

    if (!cleanIdentifier || !cleanPassword) {
        throw new AppError(400, "Missing required fields");
    }

    const fetchUser = await db.select().from(usersTable).where(or(
        eq(usersTable.username, cleanIdentifier),
        eq(usersTable.email, cleanIdentifier)
    )).limit(1).execute();

    if (fetchUser.length === 0 || !fetchUser) {
        throw new AppError(404, "User not found");
    }

    const isCredentialsValid = await AuthHelper.comparePassword(fetchUser[0].password, cleanPassword);

    if (!isCredentialsValid) {
        throw new AppError(401, "Unauthorized access!");
    }

    const payload = {
        id: fetchUser[0].id,
        username: fetchUser[0].username
    }

    const refreshToken = AuthHelper.generateRefreshToken(payload);
    const accessToken = AuthHelper.generateAccessToken(payload);
    const user = fetchUser[0];
    await db.update(usersTable).set({refreshToken}).where(eq(usersTable.id, user.id)).execute();

    return res.status(200).cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    }).cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
    }).json(new AppResponse(true, "Login successful", {accessToken, refreshToken}, 200));
});

