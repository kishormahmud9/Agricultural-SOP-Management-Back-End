import { EmployeeService } from "./employee.service.js";

const getEmployees = async (req, res) => {
  try {
    const employees = await EmployeeService.getEmployees(req.user.farmId, req.query);

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
      req.user.farmId,
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
      req.user.farmId,
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
