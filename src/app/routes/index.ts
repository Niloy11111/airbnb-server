import { Router } from "express";
import { ApplicationRoutes } from "../modules/application/application.routes";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { MetaRoutes } from "../modules/meta/meta.route";
import { OrderRoutes } from "../modules/order/order.routes";
import { PropertyRoutes } from "../modules/property/property.routes";
import { ReviewRoutes } from "../modules/review/review.routes";
import { SSLRoutes } from "../modules/sslcommerz/sslcommerz.routes";
import { UserRoutes } from "../modules/user/user.routes";
const router = Router();

const moduleRoutes = [
  {
    path: "/user",
    route: UserRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  },

  {
    path: "/properties",
    route: PropertyRoutes,
  },
  {
    path: "/application",
    route: ApplicationRoutes,
  },

  {
    path: "/order",
    route: OrderRoutes,
  },

  {
    path: "/ssl",
    route: SSLRoutes,
  },
  {
    path: "/review",
    route: ReviewRoutes,
  },
  {
    path: "/meta",
    route: MetaRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
