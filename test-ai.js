import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.VITE_API_KEY;

if (!API_KEY) {
    console.error("No API Key found in .env");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

async function listModels() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        // There isn't a direct listModels method on the client instance in the simplified SDK usage,
        // but we can try to generate content to test.
        // However, to list models we might need to use the API directly or a different method if the SDK exposes it.
        // Actually, the SDK doesn't expose listModels easily in the main entry.

        // Let's just try to generate content with a few common model names to see which one works.
        const modelsToTest = [
            "gemini-1.5-flash",
            "gemini-1.5-flash-001",
            "gemini-1.5-flash-002",
            "gemini-1.5-pro",
            "gemini-1.5-pro-001",
            "gemini-1.5-pro-002",
            "gemini-pro"
        ];

        for (const modelName of modelsToTest) {
            console.log(`Testing model: ${modelName}...`);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Hello");
                console.log(`SUCCESS: ${modelName} works!`);
                return; // Found one
            } catch (e) {
                console.log(`FAILED: ${modelName} - ${e.message}`);
            }
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

listModels();
