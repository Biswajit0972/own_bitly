import {Router} from "express";
import {sign} from "../controller/user/sign.ts";
import {login} from "../controller/user/login.ts";
import {userProfile} from "../controller/user/userProfile.ts";
import {updateUserProfile} from "../controller/user/updateProfile.ts";
import {forgetPassword, resetPassword} from "../controller/user/ForgetPassword.ts";
import {AuthenticationHelper} from "../middleware/Authentication.ts";
import {validate} from "../middleware/validation.ts";
import {loginSchema, userSchema} from "../utils/zod/zodTypes.ts";
import {updateAccessToken} from "../controller/user/revalidateToken.ts";

const userRouter = Router();
const authenticate = new AuthenticationHelper().authenticateRequest;
const revalidate = new AuthenticationHelper().revalidateToken;

/*
    Final RESTful routes:
    POST    /api/users/register         -> register new user
    POST    /api/users/login            -> login user
    GET     /api/users/profile          -> get user profile
    PUT     /api/users/profile          -> update user profile
    GET     /api/users/revalidate       -> revalidate access token
    POST    /api/users/forget-password  -> request password reset
    POST    /api/users/reset-password   -> reset password
*/

// Authentication routes (public)
userRouter.post("/api/users/register", validate(userSchema), sign);
userRouter.post("/api/users/login", validate(loginSchema), login);

// Password reset routes (public)
userRouter.post("/api/users/forget-password", forgetPassword);
userRouter.post("/api/users/reset-password", authenticate, resetPassword);

// User profile routes (protected)
userRouter
    .route("/api/users/profile")
    .get(authenticate, userProfile)
    .put(authenticate, updateUserProfile);

// Token revalidation route (protected with refresh token)
userRouter.get("/api/users/revalidate", revalidate, updateAccessToken);

export default userRouter;