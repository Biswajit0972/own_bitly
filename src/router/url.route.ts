import { Router } from "express";
import {authenticate} from "../middleware/Authentication.ts";
import {validate, validateParams} from "../middleware/validation.ts";
import {shortenSchema, urlSchema} from "../utils/zod/zodTypes.ts";
import {urlShort} from "../controller/URL/urls.ts";
import {updateUrl} from "../controller/URL/updateUrl.ts";
import {getUrl} from "../controller/URL/getUrl.ts";
import {getAllUrls} from "../controller/URL/getAll.ts";

const urlRouter = Router();

urlRouter.post("/api/urls", authenticate, validate(shortenSchema), urlShort);
urlRouter.get("/api/urls/:id",  validateParams(urlSchema), getUrl);
urlRouter.put("/api/urls/update/:id", authenticate,   validateParams(urlSchema), updateUrl);
urlRouter.delete("/api/urls/delete/:id", authenticate, validateParams(urlSchema), updateUrl);
urlRouter.get("/api/urls/all", authenticate,  getAllUrls);

export default urlRouter;