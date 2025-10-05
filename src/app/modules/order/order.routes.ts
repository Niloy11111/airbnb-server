import { Router } from "express";
import auth from "../../middleware/auth";
import { UserRole } from "../user/user.interface";
import { OrderController } from "./order.controller";

const router = Router();

router.get("/my-orders", auth(UserRole.USER), OrderController.getMyOrders);

router.get("/:orderId", auth(UserRole.USER), OrderController.getOrderDetails);

router.post("/", auth(UserRole.Tenant), OrderController.createOrder);

router.patch(
  "/:orderId/status",
  auth(UserRole.USER),
  OrderController.changeOrderStatus
);

export const OrderRoutes = router;
