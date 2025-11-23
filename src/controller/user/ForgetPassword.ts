import {Request, Response} from "express";
import {eq} from "drizzle-orm";
import {asyncHandler} from "../../utils/asyncHandler";
import {AppError} from "../../utils/AppError";
import db from "../../db/databaseConnection";
import {usersTable} from "../../db/schema/user.schema";
import {AppResponse} from "../../utils/AppResponse";
import {AuthenticationHelper} from "../../utils/helper/helper.ts";
import bcrypt from "bcrypt";

const AuthHelper: AuthenticationHelper = new AuthenticationHelper();

export const forgetPassword = asyncHandler(async (req: Request, res: Response) => {
    const {email} = req.body;

    const cleanEmail = email?.trim();

    if (!cleanEmail) {
        throw new AppError(400, "Email is required");
    }

    const fetchUser = await db.select().from(usersTable).where(
        eq(usersTable.email, cleanEmail)
    ).limit(1).execute();

    if (fetchUser.length === 0 || !fetchUser) {
        throw new AppError(404, "User not found with this email");
    }

    const resetToken = AuthHelper.generateAccessToken({
        id: fetchUser[0].id,
        email: fetchUser[0].email
    });

    await db.update(usersTable).set({
    }).where(eq(usersTable.id, fetchUser[0].id)).execute();


    return res.status(200).json(
        new AppResponse(
            true,
            "Password reset link has been sent to your email",
            {resetToken},
            200
        )
    );
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const {token, newPassword} = req.body;

    const cleanToken = token?.trim();
    const cleanPassword = newPassword?.trim();
    const user_id = req.user?.id;
    if (!cleanToken || !cleanPassword) {
        throw new AppError(400, "Token and new password are required");
    }

    // Fetch user and verify token matches
    const fetchUser = await db.select().from(usersTable).where(
        eq(usersTable.id, user_id)
    ).limit(1).execute();

    if (fetchUser.length === 0 || !fetchUser) {
        throw new AppError(404, "User not found");
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(cleanPassword, salt);

    // Update the password and clear reset token
    await db.update(usersTable).set({
        password: hashedPassword,
        // passwordResetToken: null,
        // passwordResetExpiry: null
    }).where(eq(usersTable.id, fetchUser[0].id)).execute();

    return res.status(200).json(
        new AppResponse(true,
            "Password has been reset successfully",
            null,
            200
        )
    );
});