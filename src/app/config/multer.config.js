import multer from "multer";
import path from "path";
import fs from "fs";

export const createMulterUpload = (folder = "others") => {
    const uploadPath = path.join(process.cwd(), "uploads", folder);

    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
    }

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix =
                Date.now() + "-" + Math.round(Math.random() * 1e9);
            const ext = path.extname(file.originalname);
            cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
    });

    const fileFilter = (req, file, cb) => {
        const allowedExt = /\.(pdf|doc|docx)$/i;
        const allowedMime = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];

        const extOk = allowedExt.test(file.originalname);
        const mimeOk = allowedMime.includes(file.mimetype);

        if (extOk && mimeOk) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    "Only PDF, DOC, and DOCX files are allowed"
                )
            );
        }
    };

    return multer({
        storage,
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter,
    });
};