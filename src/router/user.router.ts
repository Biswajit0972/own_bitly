import {Router} from "express";
import {sign} from "../controller/user/sign.ts";
import {login} from "../controller/user/login.ts";
import {userProfile} from "../controller/user/userProfile.ts";
import {AuthenticationHelper} from "../middleware/Authentication.ts";
import {validate} from "../middleware/validation.ts";
import {loginSchema, userSchema} from "../utils/zod/zodTypes.ts";
import {updateAccessToken} from "../controller/user/revalidateToken.ts";

const userRouter = Router();
const authHelper = new AuthenticationHelper();

userRouter.post("/api/users/register", validate(userSchema), sign);
userRouter.post("/api/users/login", validate(loginSchema), login);

//! user profile
userRouter.get("/api/users/getId", authHelper.authenticateRequest, userProfile);
// ! revalidate token
userRouter.get("/api/users/revalidate", authHelper.revalidateToken, updateAccessToken);

export default userRouter;