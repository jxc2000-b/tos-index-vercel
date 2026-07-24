import { z } from "zod";

export const MINIMUM_PASSWORD_LENGTH = 12;

export const signupSchema = z.object({
  email: z
    .string()
    .trim()
    .email("A valid email address is required.")
    .transform((email) => email.toLowerCase()),
  password: z.string().min(MINIMUM_PASSWORD_LENGTH, {
    message: `Password must be at least ${MINIMUM_PASSWORD_LENGTH} characters.`,
  }),
});

export type SignupInput = z.infer<typeof signupSchema>;

export const createPostSchema = z.object({
  title: z.string().trim().min(1, "A title is required.").max(200),
  body: z.string().trim().min(1, "Post content is required.").max(10_000),
  published: z.boolean().default(true),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
