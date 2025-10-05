import { Router } from "express";
import auth from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { phoneNumberValidations } from "../number/number.validation";
import { UserRole } from "../user/user.interface";
import { ApplicationController } from "./application.controller";
import { ApplicationValidations } from "./application.validation";

const router = Router();

// auth(UserRole.Landlord),
router.post(
  "/create-application",
  auth(UserRole.Tenant),
  validateRequest(ApplicationValidations.createApplicationValidationSchema),
  ApplicationController.createApplication
);
router.post(
  "/send-number",
  auth(UserRole.Landlord),
  validateRequest(phoneNumberValidations.sentPhoneNumberValidationSchema),
  ApplicationController.sendNumberToTenant
);

router.get(
  "/",
  auth(UserRole.Landlord, UserRole.Tenant),
  ApplicationController.getAllApplications
);

router.patch(
  "/:applicationId",
  // auth(UserRole.Landlord),
  // validateRequest(ApplicationValidations.updateApplicationValidationSchema),
  ApplicationController.updateApplication
);

export const ApplicationRoutes = router;
