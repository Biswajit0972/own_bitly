import * as z from "zod";

import {loginSchema, shortenSchema, userSchema} from "../zod/zodTypes.ts";
import {shortUrlSchema} from "../../db/models/shortUrl.schema.ts";

export type User = z.infer<typeof userSchema>;
export type UserLogin = z.infer<typeof loginSchema>;
export type UrlBody= z.infer<typeof shortenSchema>;