import axios from "axios";
import { AppError } from "../../errorHelper/appError.js";

const AI_BASE_URL = process.env.AI_BASE_URL;

export class ProxyController {
    /**
     * Proxy static files (images) from AI service
     */
    static async proxyStaticFile(req, res, next) {
        try {
            const filePath = req.params[0]; // Capture everything after /static/
            const aiUrl = `${AI_BASE_URL}/static/${filePath}`;

            const response = await axios.get(aiUrl, {
                responseType: "stream",
                timeout: 10000,
            });

            // Forward content type from AI service
            res.setHeader("Content-Type", response.headers["content-type"]);

            // Stream the image to client
            response.data.pipe(res);
        } catch (error) {
            if (error.response?.status === 404) {
                throw new AppError("Image not found", 404);
            }
            console.error("❌ Proxy error:", error.message);
            throw new AppError("Failed to fetch image", 500);
        }
    }
}
