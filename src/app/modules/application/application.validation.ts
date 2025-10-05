import { z } from "zod";

export const createApplicationValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, " name is required."),
    phoneNumber: z.string().min(1, "Phone number is required."),
    email: z.string().email("Invalid email address"),
  }),
});
export const updateApplicationValidationSchema = z.object({
  body: z.object({
    status: z.string().min(1, "Status is required.").optional(),
    landlordContactNumber: z
      .string()
      .min(10, "Phone number must be at least 10 digits")
      .optional(),
  }),
});

export const ApplicationValidations = {
  createApplicationValidationSchema,
  updateApplicationValidationSchema,
};
