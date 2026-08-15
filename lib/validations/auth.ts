import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  next: z.string().optional(),
});

export const signupSchema = z
  .object({
    email: z.string().trim().email('Enter a valid email address.'),
    password: z.string().min(8, 'Password must be at least 8 characters.'),
    fullName: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters.')
      .max(80, 'Name must be 80 characters or fewer.'),
    organizationName: z.string().trim().max(80).optional().default(''),
    inviteToken: z.string().uuid().optional(),
    next: z.string().optional(),
  })
  .superRefine((value, context) => {
    if (!value.inviteToken && value.organizationName.trim().length < 2) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['organizationName'],
        message: 'Workspace name must be at least 2 characters.',
      });
    }
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
