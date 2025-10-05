import { Router } from "express";
import { multerUpload } from "../../config/multer.config";
import auth from "../../middleware/auth";
import { parseBody } from "../../middleware/bodyParser";
import validateRequest from "../../middleware/validateRequest";
import { UserRole } from "../user/user.interface";
import { PropertyController } from "./property.controller";
import { rentalValidation } from "./property.validation";

const router = Router();

router.get("/", PropertyController.getAllProperties);

router.get("/:propertyId", PropertyController.getSingleProperty);

// auth(UserRole.Landlord),
router.post(
  "/",
  auth(UserRole.Landlord),
  multerUpload.fields([{ name: "images" }]),
  parseBody,
  validateRequest(rentalValidation.createPropertyValidationSchema),
  PropertyController.createProperty
);

router.patch(
  "/:propertyId",
  auth(UserRole.Landlord, UserRole.ADMIN),
  multerUpload.fields([{ name: "images" }]),
  parseBody,
  PropertyController.updateProperty
);

router.delete(
  "/:propertyId",
  auth(UserRole.Landlord, UserRole.ADMIN),
  PropertyController.deleteProperty
);

export const PropertyRoutes = router;
