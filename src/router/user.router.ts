import { Router } from "express";
import {sign} from "../controller/user/sign.ts";
import {login} from "../controller/user/login.ts";
import {userProfile} from "../controller/user/userProfile.ts";
import {authenticate} from "../middleware/Authentication.ts";
import {validate} from "../middleware/validation.ts";
import {loginSchema, userSchema} from "../utils/zod/zodTypes.ts";

const userRouter = Router();

userRouter.post("/api/users/register", validate(userSchema), sign);
userRouter.post("/api/users/login", validate(loginSchema), login);

userRouter.get("/api/users/getId", authenticate, userProfile);

export default userRouter;