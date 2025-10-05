import { Router } from "express";
import auth from "../../middleware/auth";
import { UserRole } from "../user/user.interface";
import { FlashSaleController } from "./flashSale.controller";

const router = Router();

router.get("/", FlashSaleController.getActiveFlashSalesService);

router.post("/", auth(UserRole.USER), FlashSaleController.createFlashSale);

export const FlashSaleRoutes = router;
