import { z } from 'zod'

export const postSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'Write something first')
    .max(280, 'Maximum 280 characters'),
})

export type PostFormValues = z.infer<typeof postSchema>