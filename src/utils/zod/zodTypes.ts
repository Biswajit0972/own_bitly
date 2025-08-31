import * as z from 'zod'

export const userSchema = z.object({
        username: z.string().nonempty(),
        email: z.email().nonempty(),
        fullName: z.string().nonempty(),
        password: z.string().nonempty()
    }
)

export const loginSchema = z.object({identifier: z.string().nonempty(), password: z.string().nonempty()});