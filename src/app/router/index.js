import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route.js";
import { AuthRouter } from "../modules/auth/auth.route.js";
import { OtpRouter } from "../modules/otp/otp.route.js";

import dashboardRoutes from "../modules/systemOwner/dashboard/dashboard.route.js";
import farmManagementRoutes from "../modules/systemOwner/farmManagment/farm.route.js";
import PlanRoutes from "../modules/systemOwner/subscriptionPlan/plan.route.js";

import homeRoutes from "../modules/farmManager/home/home.route.js";
import taskRoutes from "../modules/farmManager/task/task.route.js";
import employeeRoutes from "../modules/farmManager/employee/employee.route.js";
import profileRoutes from "../modules/farmManager/profile/profile.route.js";
import messageRoutes from "../modules/farmManager/message/message.route.js";

import employeeHomeRoutes from "../modules/employee/home/home.route.js";
import employeeSopRoutes from "../modules/employee/sop/sop.route.js";

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

  // FARM MANAGER starts here
  {
    path: "/farm-manager/home",
    route: homeRoutes,
  },

  {
    path: "/farm-manager/tasks",
    route: taskRoutes,
  },

  {
    path: "/farm-manager/employees",
    route: employeeRoutes,
  },

  {
    path: "/farm-manager/profile",
    route: profileRoutes,
  },

  {
    path: "/farm-manager/messages",
    route: messageRoutes,
  },

  // FARM MANAGER ends here

  // EMPLOYEE starts here
  {
    path: "/employee/home",
    route: employeeHomeRoutes,
  },

  {
    path: "/employee/sops",
    route: employeeSopRoutes,
  },
  // EMPLOYEE ends here
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
