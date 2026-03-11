import { AppError } from "../errorHelper/appError.js";

class DevBuildError extends AppError {
    constructor(message, statusCode) {
        super(message, statusCode);
    }
}

export default DevBuildError;