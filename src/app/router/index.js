import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route.js";
import { AuthRouter } from "../modules/auth/auth.route.js";
import { OtpRouter } from "../modules/otp/otp.route.js";

import dashboardRoutes from "../modules/systemOwner/dashboard/dashboard.route.js";
import farmManagementRoutes from "../modules/systemOwner/farmManagment/farm.route.js";
import PlanRoutes from "../modules/systemOwner/subscriptionPlan/plan.route.js";

import farmAdminDashboardRoutes from "../modules/farmAdmin/dashboard/dashboard.route.js";
import farmAdminUserRoutes from "../modules/farmAdmin/users/user.route.js";
import { OversightRoutes } from "../modules/farmAdmin/oversight/oversight.routes.js";
import SubscriptionRoutes from "../modules/farmAdmin/subscription/subscription.routes.js";
import FarmSettingsRoutes from "../modules/farmAdmin/settings/farmSettings.routes.js";
import FarmAdminSOPRoutes from "../modules/farmAdmin/sopManagement/sop.routes.js";
import { FarmAdminMessageRoutes } from "../modules/farmAdmin/message/message.route.js";

import homeRoutes from "../modules/farmManager/home/home.route.js";
import taskRoutes from "../modules/farmManager/task/task.route.js";
import employeeRoutes from "../modules/farmManager/employee/employee.route.js";
import profileRoutes from "../modules/farmManager/profile/profile.route.js";
import messageRoutes from "../modules/farmManager/message/message.route.js";
import managerSOPRoutes from "../modules/farmManager/sops/sops.route.js";

import employeeHomeRoutes from "../modules/employee/home/home.route.js";
import employeeSopRoutes from "../modules/employee/sop/sop.route.js";
import employeeTaskRoutes from "../modules/employee/task/task.route.js";
import employeeMessageRoutes from "../modules/employee/message/message.route.js";
import employeeProfileRoutes from "../modules/employee/profile/profile.route.js";
import { EmployeeAuthRoutes } from "../modules/employee/auth/auth.route.js";

// NEW ROUTES
// import { SystemAdminRoutes } from "../modules/systemOwner/admin/admin.route.js";
// import { FarmAdminRoutes } from "../modules/farmAdmin/farmAdmin.route.js";
// import { ManagerRoutes } from "../modules/manager/manager.route.js";
import { SystemOwnerAuthRoutes } from "../modules/systemOwner/auth/auth.route.js";
import { FarmManagerAuthRoutes } from "../modules/farmManager/auth/auth.route.js";
import { FarmAdminAuthRoutes } from "../modules/farmAdmin/auth/auth.route.js";

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
    path: "/system-owner/auth",
    route: SystemOwnerAuthRoutes,
  },

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

  // FARM ADMIN starts here
  {
    path: "/farm-admin/auth",
    route: FarmAdminAuthRoutes,
  },

  {
    path: "/farm-admin/dashboard",
    route: farmAdminDashboardRoutes,
  },

  {
    path: "/farm-admin/users",
    route: farmAdminUserRoutes,
  },

  {
    path: "/farm-admin/oversight",
    route: OversightRoutes,
  },

  {
    path: "/farm-admin/subscription",
    route: SubscriptionRoutes,
  },

  {
    path: "/farm-admin/settings",
    route: FarmSettingsRoutes,
  },

  {
    path: "/farm-admin/sops",
    route: FarmAdminSOPRoutes,
  },

  {
    path: "/farm-admin/messages",
    route: FarmAdminMessageRoutes,
  },

  // FARM ADMIN ends here

  // FARM MANAGER starts here
  {
    path: "/farm-manager/auth",
    route: FarmManagerAuthRoutes,
  },

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

  {
    path: "/farm-manager/sops",
    route: managerSOPRoutes,
  },

  // FARM MANAGER ends here

  // EMPLOYEE starts here
  {
    path: "/employee/auth",
    route: EmployeeAuthRoutes,
  },
  {
    path: "/employee/home",
    route: employeeHomeRoutes,
  },

  {
    path: "/employee/sops",
    route: employeeSopRoutes,
  },

  {
    path: "/employee/tasks",
    route: employeeTaskRoutes,
  },

  {
    path: "/employee/messages",
    route: employeeMessageRoutes,
  },

  {
    path: "/employee/profile",
    route: employeeProfileRoutes,
  },
  // EMPLOYEE ends here
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
