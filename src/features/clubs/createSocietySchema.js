import { z } from 'zod'

// ---- Minimum requirements (change these in one place) ----
export const MIN_MEMBERS = 10 // total, including the 3 executives
export const MIN_DESCRIPTION_LENGTH = 50
export const MAX_DESCRIPTION_LENGTH = 500
export const MAX_PROOF_SIZE_MB = 5
export const RATIFICATION_TERM = '2026–27'
export const SOCIETY_CATEGORIES = ['Academic', 'Cultural', 'Sports', 'Arts', 'Tech', 'Volunteering']

const ALLOWED_PROOF_TYPES = ['application/pdf', 'image/png', 'image/jpeg']

// Turns pasted text into a clean list of unique emails
export function parseEmails(text) {
  const emails = text
    .split(/[\s,]+/)
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
  return [...new Set(emails)]
}

const dalEmail = z
  .string()
  .trim()
  .toLowerCase()
  .email('Enter a valid email')
  .endsWith('@dal.ca', 'Must be a @dal.ca email')

export const createSocietySchema = z.object({
  // Step 1: Ratification
  isRatified: z
    .boolean()
    .refine((value) => value, 'Only DSU-ratified societies can be created on DalChat'),
  proof: z
    .any()
    .refine((files) => files?.length === 1, 'Upload your DSU ratification confirmation')
    .refine(
      (files) => !files?.[0] || ALLOWED_PROOF_TYPES.includes(files[0].type),
      'The file must be a PDF, PNG or JPG'
    )
    .refine(
      (files) => !files?.[0] || files[0].size <= MAX_PROOF_SIZE_MB * 1024 * 1024,
      `The file must be smaller than ${MAX_PROOF_SIZE_MB} MB`
    ),

  // Step 2: Details
  name: z
    .string()
    .trim()
    .min(3, 'Name must be at least 3 characters')
    .max(80, 'Name must be 80 characters or less'),
  category: z
    .string()
    .refine((value) => SOCIETY_CATEGORIES.includes(value), 'Choose a category'),
  description: z
    .string()
    .trim()
    .min(MIN_DESCRIPTION_LENGTH, `Write at least ${MIN_DESCRIPTION_LENGTH} characters`)
    .max(MAX_DESCRIPTION_LENGTH, `Keep it under ${MAX_DESCRIPTION_LENGTH} characters`),

  // Step 3: Executives
  vpName: z.string().trim().min(2, 'Enter their full name'),
  vpEmail: dalEmail,
  treasurerName: z.string().trim().min(2, 'Enter their full name'),
  treasurerEmail: dalEmail,

  // Step 4: Members
  members: z.string().superRefine((text, ctx) => {
    const invalid = parseEmails(text).filter((email) => !email.endsWith('@dal.ca'))
    if (invalid.length > 0) {
      ctx.addIssue({
        code: 'custom',
        message: `These aren't @dal.ca emails: ${invalid.join(', ')}`,
      })
    }
  }),

  // Step 5: Review
  confirmAccurate: z.boolean().refine((value) => value, 'Please confirm this'),
  agreeGuidelines: z.boolean().refine((value) => value, 'Please agree to continue'),
})