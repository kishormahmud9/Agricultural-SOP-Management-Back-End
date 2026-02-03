import { EmployeeService } from "./employee.service.js";

// TEMP (auth later)
const FARM_ID = "9581f927-4563-4808-8514-94f87840d0e8";

const getEmployees = async (req, res) => {
  try {
    const employees = await EmployeeService.getEmployees(FARM_ID, req.query);

    res.json({
      success: true,
      data: employees,
    });
  } catch (error) {
    console.error("GET_EMPLOYEES_ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch employees",
    });
  }
};

const getEmployeeDetails = async (req, res) => {
  try {
    const employee = await EmployeeService.getEmployeeDetails(
      FARM_ID,
      req.params.id,
    );

    return res.json({
      success: true,
      data: employee,
    });
  } catch (error) {
    console.error("GET_EMPLOYEE_DETAILS_ERROR:", error);

    return res.status(404).json({
      success: false,
      message: error.message || "Employee not found",
    });
  }
};

const getEmployeeTasks = async (req, res) => {
  try {
    const tasks = await EmployeeService.getEmployeeTasks(
      FARM_ID,
      req.params.id,
      req.query.type,
    );

    return res.json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    console.error("GET_EMPLOYEE_TASKS_ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load employee tasks",
    });
  }
};

export const EmployeeController = {
  getEmployees,
  getEmployeeDetails,
  getEmployeeTasks,
};
