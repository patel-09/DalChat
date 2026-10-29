import { z } from 'zod'

const dalEmail = z
  .string()
  .trim()
  .toLowerCase()
  .email('Enter a valid email address')
  .endsWith('@dal.ca', 'Use your Dalhousie email (@dal.ca)')

export const signupSchema = z
  .object({
        firstName: z.string().trim().min(1, 'Enter your first name'),
    lastName: z.string().trim().min(1, 'Enter your last name'),
    email: dalEmail,
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Include at least one uppercase letter')
      .regex(/[0-9]/, 'Include at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export const loginSchema = z.object({
  email: dalEmail,
  password: z.string().min(1, 'Enter your password'),
})