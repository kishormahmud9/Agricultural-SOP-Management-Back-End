
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:8000/api'; // Using port 8000 as per .env

// Test Credentials (from seed.js)
const EMPLOYEE_CREDS = { email: 'employee@test.com', password: '11' };
const MANAGER_CREDS = { email: 'manager@test.com', password: '11' };

const TEST_IMAGE_PATH = 'uploads/profiles/avatar-1770653011710-878901885.jpg'; // Adjust if needed

async function testImageMessaging() {
    try {
        console.log("🚀 Starting Image Messaging Test...");

        // 1. Login as Employee
        console.log("1️⃣ Logging in as Employee...");
        const empLoginRes = await axios.post(`${BASE_URL}/employee/auth/login`, EMPLOYEE_CREDS);
        const empToken = empLoginRes.data.data.accessToken;
        const empId = empLoginRes.data.data.user.id;
        console.log("   ✅ Employee Logged in as:", empLoginRes.data.data.user.name);

        // 2. Login as Manager to get ID
        console.log("2️⃣ Logging in as Manager...");
        const mgrLoginRes = await axios.post(`${BASE_URL}/farm-manager/auth/login`, MANAGER_CREDS);
        const mgrToken = mgrLoginRes.data.data.accessToken;
        const mgrId = mgrLoginRes.data.data.user.id;
        console.log("   ✅ Manager Logged in as:", mgrLoginRes.data.data.user.name);

        // 3. Employee sends message with image to Manager
        console.log("3️⃣ Employee sending image message...");
        const formData = new FormData();
        formData.append('content', 'Hello Manager, checking image upload!');
        formData.append('receiverId', mgrId);

        if (fs.existsSync(TEST_IMAGE_PATH)) {
            formData.append('image', fs.createReadStream(TEST_IMAGE_PATH));
            console.log("   📸 Attaching image:", TEST_IMAGE_PATH);
        } else {
            console.warn("   ⚠️ Test image not found at", TEST_IMAGE_PATH);
            // Create a dummy file
            fs.writeFileSync('test-image.txt', 'This is a dummy image content');
            formData.append('image', fs.createReadStream('test-image.txt'), 'test.txt'); // multer might reject this if strictly checking image
        }

        const sendRes = await axios.post(`${BASE_URL}/employee/messages/send`, formData, {
            headers: {
                ...formData.getHeaders(),
                'Authorization': empToken // Bearer prefix might be needed depending on middleware
            }
        });
        console.log("   ✅ Message Sent! ID:", sendRes.data.data.id);
        console.log("   🖼️  Image URL:", sendRes.data.data.imageUrl);

        if (!sendRes.data.data.imageUrl) {
            console.error("   ❌ Image URL is missing in response!");
        }

    } catch (error) {
        console.error("❌ Test Failed:");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("Error Message:", error.message);
        }
    }
}

testImageMessaging();
