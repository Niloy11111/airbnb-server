import { Router } from "express";
import auth from "../../middleware/auth";
import { UserRole } from "../user/user.interface";
import { ReviewControllers } from "./review.controller";

const router = Router();

router.get("/", auth(UserRole.ADMIN), ReviewControllers.getAllReviews);
router.post("/", auth(UserRole.USER), ReviewControllers.createReview);

export const ReviewRoutes = router;
