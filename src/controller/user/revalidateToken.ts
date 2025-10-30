import {Request, Response} from "express";
import {eq} from "drizzle-orm";
import {asyncHandler} from "../../utils/asyncHandler";
import {AppError} from "../../utils/AppError";
import db from "../../db/databaseConnection";
import {usersTable} from "../../db/models/user.schema";
import {AppResponse} from "../../utils/AppResponse"
import {AuthenticationHelper} from "../../utils/helper/helper";

const AuthHelper: AuthenticationHelper = new AuthenticationHelper();

export const updateAccessToken = asyncHandler(async (req: Request, res: Response) => {
    const id = req.user?.id;

    if (!id) {
        throw new AppError(400, "User ID is missing from request");
    }

    const fetchUser = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1).execute();

    if (fetchUser.length === 0 || !fetchUser) {
        throw new AppError(404, "User not found");
    }

    const payload = {
        id: fetchUser[0].id,
        username: fetchUser[0].username
    }

    const accessToken = AuthHelper.generateAccessToken(payload);
    return res
        .status(200)
        .json(new AppResponse("User token updated successfully", {accessToken}, 201));
});