import { z } from 'zod'

export const YEAR_OPTIONS = ['1st year', '2nd year', '3rd year', '4th year', '5th year+', 'Graduate']
export const BIO_MAX_LENGTH = 160

export const profileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'Enter your first name')
    .max(40, 'Keep it under 40 characters'),
  lastName: z
    .string()
    .trim()
    .min(1, 'Enter your last name')
    .max(40, 'Keep it under 40 characters'),
  program: z.string().trim().max(60, 'Keep it under 60 characters'),
  year: z
    .string()
    .refine((value) => value === '' || YEAR_OPTIONS.includes(value), 'Choose a year'),
  bio: z
    .string()
    .trim()
    .max(BIO_MAX_LENGTH, `Keep your bio under ${BIO_MAX_LENGTH} characters`),
})