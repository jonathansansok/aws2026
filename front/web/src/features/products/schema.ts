import { z } from "zod"

export const productCreateSchema = z.object({
  name: z.string().min(2, "Name is too short").max(120),
  price: z.coerce.number().min(0, "Price must be >= 0"),
  active: z.boolean().default(true),
})

export type ProductCreateInput = z.infer<typeof productCreateSchema>
