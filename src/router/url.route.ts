import { Router } from "express";
import { AuthenticationHelper } from "../middleware/Authentication.ts";
import { validate, validateParams } from "../middleware/validation.ts";
import { shortenSchema, urlSchema } from "../utils/zod/zodTypes.ts";

import { urlShort } from "../controller/URL/urls.ts";
import { updateUrl } from "../controller/URL/updateUrl.ts";
import { redirect } from "../controller/URL/redirect.ts";
import { getAllUrls } from "../controller/URL/getAll.ts";
import { deleteUrl } from "../controller/URL/deleteUrl.ts";

const urlRouter = Router();
const authenticate = new AuthenticationHelper().authenticateRequest;

/*
    Final RESTful routes:
    POST    /api/urls          -> shorten URL
    GET     /api/urls          -> get all URLs
    GET     /api/urls/:code    -> redirect
    PUT     /api/urls/:code    -> update
    DELETE  /api/urls/:code    -> delete
*/

// Create + Get All URLs
urlRouter
    .route("/")
    .post(authenticate, validate(shortenSchema), urlShort)
    .get(authenticate, getAllUrls);

// Redirect + Update + Delete
urlRouter
    .route("/:shortCode")
    .get(validateParams(urlSchema), redirect)
    .put(authenticate, validateParams(urlSchema), updateUrl)
    .delete(authenticate, validateParams(urlSchema), deleteUrl);

export default urlRouter;
