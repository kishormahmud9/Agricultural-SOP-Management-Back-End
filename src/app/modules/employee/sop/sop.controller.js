import { SopService } from "./sop.service.js";

const getSopModules = async (req, res, next) => {
  try {
    const { farmId } = req.user;

    const result = await SopService.getSopModules(farmId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getSopsByModule = async (req, res, next) => {
  try {
    const { farmId } = req.user;
    const { module } = req.params;

    if (!module) {
      return res.status(400).json({
        success: false,
        message: "module is required",
      });
    }

    const result = await SopService.getSopsByModule(farmId, module);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const downloadSop = async (req, res, next) => {
  try {
    const { sopId } = req.params;

    const result = await SopService.getSopFile(sopId);

    // Tell browser/mobile app to download
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${result.fileName}"`,
    );

    res.setHeader("Content-Type", "application/pdf");

    result.stream.pipe(res);
  } catch (error) {
    next(error);
  }
};

const viewSop = async (req, res, next) => {
  try {
    const { sopId } = req.params;

    const sop = await SopService.viewSop(sopId);

    res.status(200).json({
      success: true,
      data: sop,
    });
  } catch (error) {
    next(error);
  }
};

export const SopController = {
  getSopModules,
  getSopsByModule,
  downloadSop,
  viewSop,
};
