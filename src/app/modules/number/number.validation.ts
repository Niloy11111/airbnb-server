import { z } from "zod";

export const sentPhoneNumberValidationSchema = z.object({
  body: z.object({
    phoneNumber: z
      .string()
      .min(10, "Phone sdfsdsdnumber must be at least 10 digits"),
  }),
});

export const phoneNumberValidations = {
  sentPhoneNumberValidationSchema,
};
