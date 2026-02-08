import axios from "axios";
import FormData from "form-data";
import fs from "fs";

const AI_BASE_URL = process.env.AI_BASE_URL;

const extractSOPFromAI = async (filePath) => {
  try {
    const form = new FormData();
    form.append("file", fs.createReadStream(filePath));

    const response = await axios.post(`${AI_BASE_URL}/extract/`, form, {
      headers: {
        ...form.getHeaders(),
      },
      timeout: 120000, // 2 minutes (PDFs can be slow)
    });

    return response.data;
  } catch (error) {
    console.error("❌ AI extraction failed:", error.message);
    return null; // VERY IMPORTANT: never throw
  }
};

export const SOPAIService = {
  extractSOPFromAI,
};
