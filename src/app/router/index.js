import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route.js";
import { AuthRouter } from "../modules/auth/auth.route.js";
import { OtpRouter } from "../modules/otp/otp.route.js";


import dashboardRoutes from "../modules/systemOwner/dashboard/dashboard.route.js";
import farmManagementRoutes from "../modules/systemOwner/farmManagment/farm.route.js";
import PlanRoutes from "../modules/systemOwner/subscriptionPlan/plan.route.js";

export const router = Router();
const moduleRoutes = [
  {
    path: "/user",
    route: UserRoutes,
  },
  {
    path: "/auth",
    route: AuthRouter,
  },
  {
    path: "/otp",
    route: OtpRouter,
  },

  // SYSTEM OWNER starts here
  {
    path: "/system-owner/dashboard",
    route: dashboardRoutes,
  },

  {
    path: "/system-owner/farm",
    route: farmManagementRoutes,
  },

  {
    path: "/system-owner/plan",
    route: PlanRoutes,
  },

  // SYSTEM OWNER ends here
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
