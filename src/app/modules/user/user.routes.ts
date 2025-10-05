import { Router } from "express";
import { multerUpload } from "../../config/multer.config";
import auth from "../../middleware/auth";
import { parseBody } from "../../middleware/bodyParser";
import clientInfoParser from "../../middleware/clientInfoParser";
import validateRequest from "../../middleware/validateRequest";
import { UserController } from "./user.controller";
import { UserRole } from "./user.interface";
import { UserValidation } from "./user.validation";

const router = Router();

router.get("/", UserController.getAllUser);

router.get(
  "/me",
  auth(UserRole.ADMIN, UserRole.Landlord, UserRole.Tenant, UserRole.USER),
  UserController.myProfile
);

router.post(
  "/",
  clientInfoParser,
  validateRequest(UserValidation.userValidationSchema),
  UserController.registerUser
);
// update customer profile
router.patch(
  "/update-profile",
  auth(UserRole.USER, UserRole.Landlord, UserRole.Tenant),
  multerUpload.single("profilePhoto"),
  parseBody,
  validateRequest(UserValidation.customerInfoValidationSchema),
  UserController.updateProfile
);
// update user profile(update User Model / user collections)
router.patch(
  "/edit-profile",
  auth(UserRole.ADMIN, UserRole.Landlord, UserRole.Tenant),
  multerUpload.single("profilePhoto"),
  parseBody,
  validateRequest(UserValidation.UserInfoValidationSchema),
  UserController.updateUserProfile
);

router.patch(
  "/:id/status",
  auth(UserRole.ADMIN),
  validateRequest(UserValidation.UserStatusValidationSchema),
  UserController.updateUserStatus
);

export const UserRoutes = router;
