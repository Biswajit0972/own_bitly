import * as z from 'zod'

export const userSchema = z.object({
        username: z.string().nonempty(),
        email: z.email().nonempty(),
        fullName: z.string().nonempty(),
        password: z.string().nonempty()
    }
)

export const loginSchema = z.object({identifier: z.string().nonempty(), password: z.string().nonempty()});

export const shortenSchema = z.object({
    url: z.url().nonempty(),
    tittle: z.string().optional(),
    shortCode: z.string().optional(),
});

export const urlSchema = z.object({shortCode: z.string().nonempty()});