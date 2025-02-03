import { z } from "zod";

export const updateProfileSchema = () => {
    return z.object({
      name: z
        .string()
        .trim()
        .min(1, { message: "Name is required"}),
        email: z.string().trim().email({
          message: "Not valid email",
        }),
      bio: z.string().optional(),
      location: z.string().optional(),
      website: z.string().optional(),
      image: z.custom((val) => val instanceof File).optional(),
    });
  };