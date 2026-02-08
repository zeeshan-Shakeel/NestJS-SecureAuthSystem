import z from "zod";

export const registerUserSchema = z.object({
    name: z.string().min(3,{message:"Name must be at least 3 characters long"}),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['User', 'admin']).optional()
})

export type RegisterUserDto = z.infer<typeof registerUserSchema>;




export const loginUserSchema=z.object({
    email: z.string().email(),
    password: z.string().min(6),
});
export type loginUserDto=z.infer<typeof loginUserSchema>;






export const userResponseSchema=registerUserSchema.omit({password:true});
export type UserResponseDto=z.infer<typeof userResponseSchema>;