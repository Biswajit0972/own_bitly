import * as z from "zod";

import {loginSchema, shortenSchema, urlSchema, userSchema} from "../zod/zodTypes.ts";

export type User = z.infer<typeof userSchema>;
export type UserLogin = z.infer<typeof loginSchema>;
export type UrlBody= z.infer<typeof shortenSchema>;
export type ShortCode = z.infer<typeof urlSchema>;