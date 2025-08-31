import * as z from "zod";

import {loginSchema, userSchema} from "../zod/zodTypes.ts";

export type User = z.infer<typeof userSchema>;
export type UserLogin = z.infer<typeof loginSchema>;