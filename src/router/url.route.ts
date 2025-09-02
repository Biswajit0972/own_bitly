import { Router } from "express";
import {authenticate} from "../middleware/Authentication.ts";
import {validate} from "../middleware/validation.ts";
import {shortenSchema} from "../utils/zod/zodTypes.ts";
import {urlShort} from "../controller/URL/urls.ts";

const urlRouter = Router();

urlRouter.post("/api/urls", authenticate, validate(shortenSchema), urlShort);


export default urlRouter;