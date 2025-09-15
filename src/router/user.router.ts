import { Router } from "express";
import { sign } from "../controller/user/sign.ts";
import { login } from "../controller/user/login.ts";
import { userProfile } from "../controller/user/userProfile.ts";
import { authenticate, revalidateTokenAuth } from "../middleware/Authentication.ts";
import { validate } from "../middleware/validation.ts";
import { loginSchema, userSchema } from "../utils/zod/zodTypes.ts";
import { updateAccessToken } from "../controller/user/revalidateToken.ts";

const userRouter = Router();

userRouter.post("/api/users/register", validate(userSchema), sign);
userRouter.post("/api/users/login", validate(loginSchema), login);

userRouter.get("/api/users/getId", authenticate, userProfile);
userRouter.get("/api/users/revalidate", revalidateTokenAuth, updateAccessToken);

export default userRouter;