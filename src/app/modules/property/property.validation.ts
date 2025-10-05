import { z } from "zod";
import { PropertyTypeEnum } from "../../../lib/constants";

const createPropertyValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    price: z.coerce.number().positive().min(0).int(),
    securityDeposit: z.coerce.number().positive().min(0).int(),
    applicationFee: z.coerce.number().positive().min(0).int(),
    isPetsAllowed: z.boolean(),
    isParkingIncluded: z.boolean(),
    // imageUrls: z
    //   .array(z.instanceof(File))
    //   .min(1, "At least one photo is required"),
    amenities: z.string().min(1, "Amenities are required"),
    highlights: z.string().min(1, "Highlights are required"),
    beds: z.coerce.number().positive().min(0).max(10).int(),
    baths: z.coerce.number().positive().min(0).max(10).int(),
    squareFeet: z.coerce.number().int().positive(),
    propertyType: z.nativeEnum(PropertyTypeEnum),
    // address: z.string().min(1, "Address is required"),
    // city: z.string().min(1, "City is required"),
    // state: z.string().min(1, "State is required"),
    // country: z.string().min(1, "Country is required"),
    // postalCode: z.string().min(1, "Postal code is required"),
  }),
});

const updatePropertyValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Rental name cannot be empty").optional(),
    // location: z.string().min(1, "Rental location cannot be empty").optional(),
    description: z
      .string()
      .min(1, "Rental description cannot be empty")
      .optional(),
    price: z.number().min(0, "Rental price cannot be less than 0").optional(),
    beds: z.number().min(0, "Number of beds cannot be less than 0").optional(),
    landlord: z.string().min(1, "Landlord ID cannot be empty").optional(),
  }),
});

export const rentalValidation = {
  createPropertyValidationSchema,
  updatePropertyValidationSchema,
};
