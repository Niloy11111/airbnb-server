import { Router } from "express";
import auth from "../../middleware/auth";
import { UserRole } from "../user/user.interface";
import { MetaController } from "./meta.controller";

const router = Router();

router.get(
  "/",
  auth(UserRole.ADMIN, UserRole.USER),
  MetaController.getMetaData
);

export const MetaRoutes = router;
